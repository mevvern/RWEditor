import * as PIXI from "./lib/pixi.mjs"; //dont ask me why i did this. i do not want to answer
import * as projection from "./lib/pixi-projection.mjs"
import {vec2, vec3, vec4, Area, Layer, LINGO, getShader} from "./utils.mjs";
import {level} from "./main.mjs";
import {editor} from "./main.mjs";
import {RenderLayerWith1Sprite} from "./renderLayer.mjs"
import {ButtonOptions} from "./ui.mjs";

export class RenderContext {
	constructor(levelSize) {
		this.#levelTileSize = levelSize;

		this.#levelPixelSize = new vec2(this.#currentTileSize * this.#levelTileSize.x, this.#currentTileSize * this.#levelTileSize.y);

		this.#screenCenter = new vec2(window.screen.availWidth / 2, window.screen.availHeight / 2);

		this.layers = [];

		this.textures = {DEFAULT : DEFAULT_TEXTURE, WHITE : WHITE, INVISIBLE : INVISIBLE};

		this.materials = {};

		this.palettes = [];

		this.#grid.visible = false;

		//this.#getMaterialInits();

		this.#initView();

		this.#initWholeThing();

		this.clearRenders = () => {
			for (const layer of this.layers) {
				layer.clearRenderTextures();
			}
		}

		this.renderAll = () => {
			for (const layer of this.layers) {
				layer.renderAll();
			}
			this.#updateShadowMap(new vec2(0, 29));
		}

		/**
		 * 
		 * @param {Array} tileList 
		 */
		this.setTile = (tileList) => {
			const variant = 0;
			const option = 0;

			if (tileList instanceof Array) {
				//convert list of Level Space tiles (3 depths) to Render Space tiles (30 depths)
				const spriteList = [];

				for (const tile of tileList) {
					if (!(tile.materialId in this.materials)) {
						console.warn("material \"" + tile.materialId + "\" does not exist! applied default material of \"standard\"");
						tile.materialId = "standard";
					}

					const material = this.materials[tile.materialId];

					for (const [index, layer] of material.layers[tile.geometryId].entries()) {
						const sprite = {};

						sprite.pos = tile.pos.dupe();
						sprite.pos.z = index + sprite.pos.z * 10;

						switch(tile.geometryId) {
							case "air":
								sprite.texture = INVISIBLE;
							break
							case "wall":
							case "slope BL":
							case "slope TL":
							case "slope TR":
							case "slope BR":
							case "semisolid platform":
								sprite.texture = material.options[option][tile.geometryId][variant][layer];
							break

						}

						spriteList.push(sprite)
					}
				}

				//sort the sprites into their right layers
				const sortedSprites = [];

				for (const sprite of spriteList) {
					if (!(sortedSprites[sprite.pos.z] instanceof Array)) {
						sortedSprites[sprite.pos.z] = [];
					}

					sortedSprites[sprite.pos.z].push(sprite);
				}

				//send the sorted sprites to the Layer to be rendered
				let highestLayer = 29;

				for (const [index, layer] of sortedSprites.entries()) {
					if (layer) {
						if (index < highestLayer) {
							highestLayer = index;
						}

						const renderLayer = this.layers[index];
						renderLayer.updateTile(layer);
					}
				}

				this.#updateShadowMap(highestLayer);
			} else {
				throw new TypeError("tileList must be an Array!");
			}
		}

		this.setPreview = (materialId, option, depth, geometry) => {
			console.log(depth);

			option = 0;

			const material = this.materials[materialId];

			const textures = [];

			for (const layer of material.layers[geometry]) {
				textures.push(material.options[option][geometry][0][layer]);
			}

			console.log(textures)

			for (const previewSprite of this.#preview) {
				previewSprite.alpha = 0;
			}

			for (const [index, texture] of textures.entries()) {
				const targetLayer = index + (depth * 10);
				const previewSprite = this.#preview[targetLayer];

				previewSprite.alpha = 1;
				previewSprite.texture = texture;
			}
		}
	}
	//------------------------privates-------------------------------//
	

	//---------------pixi inits

	#initWholeThing = async () => {
		this.#initLevelUi();
		await this.#initLevelBody();
		this.#initCamera();
		this.#initPreview();

		await this.#getMaterialInits();
		await this.#getPalettes();

		this.#updateViewPos();
		this.#updateViewDistance();
		this.#updateShadowParams();
		this.#updateSkew();

		this.setPreview("bricks", 0, 0, "wall");
		//this.#generateTestTiles("bricks");
	}

	#initView = () => {
		document.body.appendChild(app.view);
		app.stage.addChild(this.#camera);
	}

	#initLevelBody = async () => {
		for (const layer of this.layers) {
			layer.destroy({children : true});
		}
		this.layers = [];

		const shaderSrcs = {};

		shaderSrcs["rgb to red"] = await getShader("rgb to red");
		shaderSrcs["renderShadow"] = await getShader("renderShadow");
		shaderSrcs["generateShadowMap"] = await getShader("generateShadowMap");

		for (let i = 0; i < 30; i++) {

			const layer = new RenderLayerWith1Sprite(this.#levelTileSize, new vec2(1.81, 0.001), 29 - i, shaderSrcs);

			layer.position3d.set((-this.#defaultTileSize * this.#levelTileSize.x) / 2, (-this.#defaultTileSize * this.#levelTileSize.y) / 2, (29 - i) * 10);

			layer.pivot3d.set(0);
			layer.pivot.set(0);

			this.layers.unshift(layer);
			this.#layerContainer.addChild(layer);

			//console.log(this.#levelBody.scale3d);
		}
	
		this.#uiContainer.addChild(this.#grid, this.#levelOutline);

		this.#levelBody.addChild(this.#layerContainer, this.#uiContainer);

		window.addEventListener("resize", () => {
			for (const layer of this.layers) {
				layer.updateResolution();
			}
		})

		//this.#levelBody.euler.roll = 0.1;
	}

	#initCamera = () => {
		this.#camera.setPlanes(2000, 0.1, 1000, false); //focus plane, near plane, far plane, orthographic boolean
		this.#camera.position.set(this.#screenCenter);
		this.#camera.addChild(this.#levelBody);
	}

	#initPreview = () => {
		this.#preview = [];
		for (const [depth, layer] of this.layers.entries()) {
			const sprite = new PreviewSprite();
			sprite.texture = DEFAULT_TEXTURE;
			//sprite.tint = [(30 - depth) / 30, (30 - depth) / 30, (30 - depth) / 30];
			//sprite.alpha = 0.5;
			sprite.width = this.#defaultTileSize;
			sprite.height = this.#defaultTileSize;
			//sprite.position.set(100, 100);
			this.#preview.push(sprite);
			layer.previewContainer.addChild(sprite);
		}
	}

	#initLevelUi = async () => {
		const gridTex = await PIXI.Texture.fromURL("./resources/render/generic/gridCellThick.png");
		const borderTex = await PIXI.Texture.fromURL("./resources/render/generic/levelOutline.png");

		this.#grid.texture = gridTex;
		this.#levelOutline.texture = borderTex;

		this.#grid.width = this.#levelPixelSize.x;
		this.#grid.height = this.#levelPixelSize.y;

		this.#levelOutline.pivot.set(724, 434);
		this.#levelOutline.tint = [0, 0, 0];

		this.#levelOutline.width = this.#levelPixelSize.x * (1 + (8 / 1440));
		this.#levelOutline.height = this.#levelPixelSize.y * (1 + (8 / 760));

		this.#grid.pivot.set(this.#levelPixelSize.x / 2, this.#levelPixelSize.y / 2);
		this.#grid.tileScale.set(0.1);
	}

	//--------------textures-----------------------------------------------------------------

	#getPalettes = async () => {
		//hardcoded palette count for now
		const paletteCount = 37;

		for (let i = 0; i < paletteCount; i++) {
			const palette = await PIXI.Texture.fromURL("./resources/palettes/palette" + i + ".png");

			palette.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

			this.palettes.push(palette);
		}

		this.palette = 1;
	}

	#getMaterialInits = async () => {
		const json = await fetch("./resources/render/materials/materials.json").catch(() => {
			console.warn("materials.json is missing");
			return null;
		})

		const parsed = await json.json();

		const materials = {};

		const tileDefaults = {};

		tileDefaults.wall = await PIXI.Texture.fromURL("./resources/render/generic/wall.png");
		tileDefaults["slope BL"] = await PIXI.Texture.fromURL("./resources/render/generic/slope BL.png");
		tileDefaults["slope TL"] = await PIXI.Texture.fromURL("./resources/render/generic/slope TL.png");
		tileDefaults["slope TR"] = await PIXI.Texture.fromURL("./resources/render/generic/slope TR.png");
		tileDefaults["slope BR"] = await PIXI.Texture.fromURL("./resources/render/generic/slope BR.png");
		tileDefaults["semisolid platform"] = tileDefaults.wall;

		for (const materialId of Object.keys(parsed)) {
			if (materialId in Object.keys(this.materials)) {
				console.warn("skipped material \"" + materialId +"\" due to duplicate material name");
			} else {
				const materialParams = parsed[materialId]
				materialParams.id = materialId;
				console.log("parsing: " + materialId);
				materials[materialId] = await this.#getMaterialTextures(materialParams);
	
				for (const option of materials[materialId].options) {
					 for (const geoType of Object.keys(option)) {
						for (const variant of option[geoType]) {
							variant.unshift(tileDefaults[geoType]);
							variant.unshift(INVISIBLE);
							let texIndex = 0;
							for (const texture of variant) {
								texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
								texture.id = materialId + option + geoType + texIndex;
								texIndex++
							}
						}
					}
				}
			}
		}

		console.log(materials);
		this.materials = materials;
	}

	#getMaterialTextures = async (materialParams) => {
		function generateFrame(sourceRect) {
			if (sourceRect instanceof vec4) {
				const frame = {
					"frame": {"x" : sourceRect.x, "y" : sourceRect.y, "w" : sourceRect.z, "h" : sourceRect.w},
					"rotated": false,
					"trimmed": false,
					"spriteSourceSize": {"x" : 0, "y" : 0, "w" : sourceRect.z, "h" : sourceRect.w},
					"sourceSize": {"w" : sourceRect.z, "h" : sourceRect.w},
					"anchor": {"x":0,"y":0}
				};
				
				return frame;
			} else {
				throw new TypeError("source rect must be vec4!")
			}
		}

		const material = {};

		material.id = materialParams.id;
		material.type = materialParams.type;
		material.layers = {
			wall : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			"slope BL" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			"slope TL" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			"slope TR" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			"slope BR" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			semisolid : [1, 2, 3, 4, 5],
			air: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			"pole V": [],
			"pole H": [],
		}

		if (materialParams.wall instanceof Array) {
			material.layers.wall = materialParams.wall;
		}

		if (materialParams.pole instanceof Array) {
			material.layers["pole V"] = materialParams.slope;
			material.layers["pole H"] = materialParams.slope;
		}

		if (materialParams.slope instanceof Array) {
			material.layers["slope BL"] = materialParams.slope;
			material.layers["slope TL"] = materialParams.slope;
			material.layers["slope TR"] = materialParams.slope;
			material.layers["slope BR"] = materialParams.slope;
		}

		if (materialParams.layers === undefined) {
			materialParams.layers = 1;
		}

		if (materialParams.options === undefined) {
			materialParams.options = 1;
		}

		let data;
		let semisolidData;

		/*
			material : {
				type : the type of the material,
				options : [
					textures : {
						tile type : [variants : [
							layers
						]],
						tile type2 : [layers]
					}
				]
			}

			each material contains an array of all its options, and each option contains textures corresponding to each geometry type. each geometry type
			contains all the variants of that geometry type, and each variant contains its layers, which are the actual textures. to get a specific texture,
			it would be like this: material[optionIndex]["wall"][variantIndex][layerIndex]
		*/

		material.options = [];

		switch(material.type) {
			case "tile" :
				data = {}
				data.frames = {}
				data.meta = {
					"scale": 1
				}
		
				semisolidData = {}
				semisolidData.frames = {}
				semisolidData.meta = {
					"scale": 1
				}	

				for (let i = 0; i < materialParams.layers; i++) {
					//generate spritesheet data for the wall and slopes based on number of layers
					data.frames[i] = generateFrame(new vec4(i * (materialParams.baseSize + 1), 0, materialParams.baseSize, materialParams.baseSize));
				}

				for (let i = 0; i < 5; i++) {
					//generate spritesheet data for specifically semisolids, which are always made of 5 layers
					semisolidData.frames[i] = generateFrame(new vec4(i * (materialParams.baseSize + 1), 0, materialParams.baseSize, materialParams.baseSize));
				}
				
				material.options.push({
					"slope BL" : [[[]]],
					"wall" : [[[]]],
					"slope TL" : [[[]]],
					"slope TR" : [[[]]],
					"slope BR" : [[[]]],
					"semisolid platform" : [[[]]]
				})

				for (const tileType of Object.keys(material.options[0])) {
					let spriteSheetData = data
					if (tileType === "semisolid platform") {
						spriteSheetData = semisolidData;
					}

					const baseTexture = await PIXI.Texture.fromURL(`./resources/render/materials/${materialParams.id}/${tileType}.png`);

					const sheet = new PIXI.Spritesheet(baseTexture, spriteSheetData);

					await sheet.parse();

					for (const textureIndex of Object.keys(sheet.textures)) {
						material.options[0][tileType][0][textureIndex] = sheet.textures[textureIndex];
					}

					PIXI.utils.clearTextureCache();
				}
			break
			case "randomSimpleConnected":
			case "simpleConnected":
				data = [];
		
				semisolidData = {}
				semisolidData.frames = {}
				semisolidData.meta = {
					"scale": 1
				}	

				for (let optionIndex = 0; optionIndex < materialParams.options; optionIndex++) {
					data.push([]);
					let count = 0;

					for (let x = 0; x < 4; x++) {
						for (let y = 0; y < 4; y++) {
							//generate spritesheet data for the wall and slopes based on number of layers
							data[optionIndex].push({
								frames : {},
								meta : {
									scale : 1
								}
							});
	
							for (let layer = 0; layer < materialParams.layers; layer++) {
								data[optionIndex][count].frames[layer] = generateFrame(new vec4(x * (materialParams.baseSize + 1), (y + layer) * (materialParams.baseSize + 1), materialParams.baseSize, materialParams.baseSize));
							}
	
							count++;
						}
					}
				}

				for (let i = 0; i < 5; i++) {
					//generate spritesheet data for specifically semisolids, which are always made of 5 layers
					semisolidData.frames[i] = {
						"frame": {"x": i * (materialParams.baseSize + 1),"y" : 0,"w" : materialParams.baseSize,"h" : materialParams.baseSize},
						"rotated": false,
						"trimmed": false,
						"spriteSourceSize": {"x":0,"y":0,"w":20,"h":20},
						"sourceSize": {"w":20,"h":20},
						"anchor": {"x":0,"y":0}
					}
				}

				for (const [optionIndex, optionGroup] of data.entries()) {
					material.options.push({
						"slope BL" : [[]],
						"wall" : [[]],
						"slope TL" : [[]],
						"slope TR" : [[]],
						"slope BR" : [[]],
						"semisolid platform" : [[]]
					})

					for (const tileType of Object.keys(material.options[optionIndex])) {
						if (tileType === "wall") {
							const baseTexture = await PIXI.Texture.fromURL(`./resources/render/materials/${materialParams.id}/${optionIndex}/${tileType}.png`);
							for (const [variantIndex, variantGroup] of optionGroup.entries()) {
	
								let spriteSheetData = variantGroup;
		
								const sheet = new PIXI.Spritesheet(baseTexture, spriteSheetData);
			
								await sheet.parse();
			
								material.options[optionIndex][tileType][variantIndex] = [];

								for (const textureKey of Object.keys(sheet.textures)) {
									//console.log(textureKey);
									material.options[optionIndex][tileType][variantIndex].push(sheet.textures[textureKey]);

								}
			
								PIXI.utils.clearTextureCache();
							}
						}
					}
				}
			break
			case "complexConnected":
			case "randomComplexConnected":

			break
		}
		//console.log(material.options, material.id);
		return material;
	}

	#getGeoTextures = async () => {
		const tileList = editor.modes.geometry.tileSet;

		for (const buttonOption of tileList) {
			if (buttonOption instanceof ButtonOptions) {
				for (const geoId of buttonOption.textures) {
					const tex = await this.#getTexture(geoId, "geometry").catch(() => {
						return DEFAULT_TEXTURE;
					});

					tex.id = geoId;
					this.textures[geoId] = tex;
				}
			} else {
				const tex = await this.#getTexture(buttonOption, "geometry").catch(() => {
					return DEFAULT_TEXTURE;
				});

				tex.id = buttonOption;
				this.textures[buttonOption] = tex;
			}
		}
	}

	#getTexture = (textureId, type) => {
		//type can be tile, prop, or geometry
		switch (type) {
			default:
				throw new Error("type must be tile, prop, or geometry!");

			break
			case "geometry":
				return PIXI.Texture.fromURL("./resources/render/geometry/" + textureId + ".png");
			break
			case "tile":
				return null

			break
			case "prop":
				return null

			break
		}
	}

	#initTextures = async () => {
		//get geometry

	}

	//--------------shaders----------------------------------------------------------------



	//---------------------utils-----------------------------------------------------------------

	#generateTestTiles = (materialId) => {
		console.log(this.materials)

		for (let i = 0; i < 30; i++) {
			const tile1 = {};

			tile1.pos = new vec3(5, i + 1, i);
			tile1.texture = this.materials[materialId].options[0]["wall"][0][1];

			this.layers[i].updateTile([tile1]);
		}
	}

	#screenToLevel = (pos) => {		//takes a screenspace coordinate and returns the associated levelspace coordinate
		let levelPos = new vec3(0, 0, pos.z);

		const scaleFac = this.#defaultTileSize / this.#currentTileSize

		levelPos.x = (pos.x - this.levelOrigin.x) * scaleFac;
		levelPos.y = (pos.y - this.levelOrigin.y) * scaleFac;

		return levelPos;
	}

	#levelToScreen = (pos) => {		//takes a levelspace coordinate and returns the associated screenspace coordinate
		//to turn that into screenspace pixel coords, the scale and position of the view will need to be taken into account
		let screenPos = new vec3(0, 0, pos.z);

		const scaleFac = this.#defaultTileSize / this.#currentTileSize;
		
		screenPos.x = (this.#viewPos.x + this.#screenCenter.x) - (this.#levelPixelSize.x / 2);
		screenPos.y = (this.#viewPos.y + this.#screenCenter.y) - (this.#levelPixelSize.y / 2);
		
		//screenPos.x = (((this.#viewPos.x * scaleFac) - (this.#levelPixelSize.x * 0.5)) + pos.x) / scaleFac;
		//screenPos.y = (((this.#viewPos.y * scaleFac) - (this.#levelPixelSize.y * 0.5)) + pos.y) / scaleFac;

		return screenPos;
	}

	#tileToLevel = (pos, coarseness) => {			//takes in a tile coordinate and outputs the associated level pixel coordinate
		let levelPos = new vec3(0, 0, pos.z);

		const tileDensity = this.#defaultTileSize / coarseness;

		levelPos.x = pos.x * tileDensity;
		levelPos.y = pos.y * tileDensity;
		
		return levelPos;
	}

	#levelToTile = (pos, coarseness) => {				//takes in a levelspace coordinate and outputs the tile which it's over
		let tilePos = new vec3(0, 0, pos.z);
		
		const tileDensity = this.#defaultTileSize / coarseness;

		tilePos.x = Math.floor(pos.x / tileDensity);
		tilePos.y = Math.floor(pos.y / tileDensity);

		return tilePos;
	}

	#adjustableTileToLevel = (pos, coarseness) => {
		return this.#tileToLevel(this.#levelToTile(pos, coarseness), coarseness);
	}

	//------------------updators-------------------------------------------------------------------------------------------

	#updateShadowMap = (highestLayer) => {
		if (this.#useShadows) {
			if (typeof highestLayer === "number") {
				const range = new vec2(highestLayer + 1, 29);
	
				for (let layerNumber = range.x; layerNumber <= range.y; layerNumber++) {
	
					if (layerNumber > 0) {
						const map = this.layers[layerNumber - 1].getShadowMap();
						this.layers[layerNumber].shadowMap = map;
					}
				}
			}
		}
	}

	#updateViewPos = () => {
		const scaleFac = this.#defaultTileSize / this.#currentTileSize

		this.#levelBody.position3d.set(this.#viewPos.x * scaleFac, this.#viewPos.y * scaleFac, 0);

		this.#levelOrigin = this.#levelToScreen(new vec2());

		this.#updateMouseScreenPos();

		for (const layer of this.layers) {
			layer.updateQuadSize();
		}
	}

	#updateViewSize = () => {
		if (this.#viewSize < -this.#defaultTileSize + 2) {
			this.#viewSize = -this.#defaultTileSize + 1;
		}

		this.#currentTileSize = this.#defaultTileSize + this.#viewSize;
		this.#levelPixelSize = new vec2(this.#currentTileSize * this.#levelTileSize.x, this.#currentTileSize * this.#levelTileSize.y);
		this.#levelBody.scale.set(this.currentTileSize / this.#defaultTileSize);

		this.#levelOrigin = this.#levelToScreen(new vec2());

		this.#updateViewPos();
		this.#updateMouseScreenPos();

		for (const layer of this.layers) {
			layer.updateQuadSize();
		}
	}

	#updateLayerVisibility = () => {
		for (const [visChoice, uiLayer] of this.#layerVisibility.entries()) {
			for (let i = uiLayer * 10; i < (uiLayer + 1) * 10; i++) {
				this.layers[i].visible = visChoice;
			}
		}
	}

	#updatePreviewTexture = () => {
		for (const [index, texId] of this.#previewTexIdsList.entries()) {
			this.#preview[index].texture = this.textures[texId];
		}
	}

	#updatePreviewPos = () => {
		let pos;

		if (this.#previewAlignToGrid === "coarse") {
			pos = this.#adjustableTileToLevel(this.#mouseLevelPos, 1);

		} else if (this.#previewAlignToGrid === "fine") {
			pos = this.#adjustableTileToLevel(this.#mouseLevelPos, 2);

		} else {
			pos = this.#mouseLevelPos;
		}

		if (pos.x < 0 || pos.y < 0) {
			this.previewVisible = false;
		} else {
			this.previewVisible = true;
		}

		for (const previewSprite of this.#preview) {
			previewSprite.position.set(pos);
		}
	}

	#updateSkew = () => {
		console.log("skewangle is unused");
	}

	#updateViewDistance = () => {
		console.log("viewdistance is unused");
	}

	#updateMouseScreenPos = () => {

		this.#mouseLevelPos = this.#screenToLevel(this.#mouseScreenPos);
		editor.mouse.tile = this.#levelToTile(this.#mouseLevelPos, 1);

		this.#updatePreviewPos();
	}

	#updatePreviewAlignment = () => {
		this.#updatePreviewPos();
	}

	#updatePreviewVis = () => {
		for (const previewSprite of this.#preview) {
			previewSprite.visible = this.#previewVisible;
		}
	}

	#updateShadowParams = () => {
		for (const layer of this.layers) {
			layer.shadowUniforms = this.#shadowParams;
		}
		//this.#updateShadowMap(0);
	}

	#updateShadowRendering = () => {
		for (const layer of this.layers) {
			layer.useShadowShader = this.#useShadows;
		}
	}

	#updateShadowDebug = () => {
		for (const layer of this.layers) {
			layer.debugShadows = this.#shadowDebug;
			/* if (this.#shadowDebug === true) {
				layer.enableColorFilter = false;
			} else {
				layer.enableColorFilter = true;
			} */
		}
	}

	#updateRenderMode = () => {
		for (const layer of this.layers) {
			layer.renderMode = this.#renderMode;
		}
	}

	#updatePalette = () => {
		for (const layer of this.layers) {
			layer.palette = this.palettes[this.#paletteIndex];
		}
	}

	//----------------------private properties------------------------//

	#mouseScreenPos = new vec3();				//the position of the mouse cursor in screen space
	#mouseLevelPos = new vec3()					//the position of the mouse cursor in level space
	#levelOrigin = new vec2();					//the position of the top left corner of the level in screen space

	#previewAlignToGrid = "none";			//the level to which the preview should be aligned to the grid
	#previewVisible = true;
	#useShadows = true;
	#shadowDebug = false;
	#renderMode = "finalRender";
	#paletteIndex = 0;
	
	#viewPos = new vec2();				//position of the view in screen space. the origin of the level is in its center
	#viewSize = 0;								//change in size of each tile from the default tile size of 20
	#layerVisibility = [1, 1, 1];	//visibility of each "ui" layer
	#levelPixelSize;							//current size of the level in pixels
	#currentTileSize = DEFAULT_TILE_SIZE;				//current size of each tile in pixels
	#depthMagnitude = 0.4;				//how "far" the layers should be from each other. max is 3.333. in reality this controls how much each layer gets scaled down to provide a fake perspective effect
	#skewAngle = 1;								//the angle with which to skew the vertices of the level. RADIANS!!!!
	#skewMagnitude = 50;					//how far that skew operation will go in that angle
	#shadowParams = [0.8462, 0.002]; //shadow parameters for the level. first entry is the angle, second entry is the magnitude

	#previewTexIdsList = new Array(30);	//id of the texture which should be assigned to the preview indicator for each layer. always a length of 30 
	
	#levelTileSize = new vec2();					//size of the level in tiles
	#screenCenter;												//stores the center of the screen at init
	#defaultTileSize = DEFAULT_TILE_SIZE; //the default tile size in pixels
	#currentMode = "geometry"							//current viewing mode of the renderer
	#texInits = {}												//the texture init files taken from the original editor. parsed from a lingo object to a javascript object

	#levelBody = new projection.Container3d();
	#camera = new projection.Camera3d();
	#preview = [];
	#uiContainer = new PIXI.Container();
	#layerContainer = new projection.Container3d();
	#grid = new PIXI.TilingSprite();
	#levelOutline = new PIXI.Sprite();
	
	//--------------------------setters and getters-------------------//

	set viewPos(pos) {
		this.#viewPos = pos;
		this.#updateViewPos();
	}

	get viewPos() {
		return this.#viewPos;
	}

//----------------------------//
	set viewSize(size) {
		this.#viewSize = size;
		this.#updateViewSize();
	}

	get viewSize() {
		return this.#viewSize;
	}

//----------------------------//
	set layerVis(visArr) {
		this.#layerVisibility = visArr;
		this.#updateLayerVisibility();
	}

	get layerVis() {
		return this.#layerVisibility
	}

//----------------------------//
	set previewTexture(textureIdsList) {
		this.#previewTexIdsList = textureIdsList;
		this.#updatePreviewTexture();
	}

	get previewTexture() {
		return this.#previewTexIdsList;
	}

//----------------------------//
	set depthMagnitude(magnitude) {
		this.#depthMagnitude = magnitude;
		this.#updateViewDistance();
	}

	get depthMagnitude() {
		return this.#depthMagnitude;
	}

//----------------------------//
	set skewAngle(angle) {
		this.#skewAngle = angle;
		this.#updateSkew();
	}

	get skewAngle() {
		return this.#skewAngle;
	}

//----------------------------//
	set skewMagnitude(magnitude) {
		this.#skewMagnitude = magnitude;
		this.#updateSkew();
	}

	get skewMagnitude() {
		return this.#skewMagnitude;
	}

//----------------------------//
	get currentTileSize() {
		return this.#currentTileSize;
	}

	set currentTileSize(size) {
		throw new Error("currentTileSize is read only");
	}

//----------------------------//
	get levelOrigin() {
		return this.#levelOrigin;
	}

	set levelOrigin(cev) {
		throw new Error("levelOrigin is read only");
	}

//----------------------------//
	get mouseScreenPos() {
		return this.#mouseScreenPos;
	}

	set mouseScreenPos(pos) {
		this.#mouseScreenPos = pos;
		this.#updateMouseScreenPos();
	}

//----------------------------//
	get mouseLevelPos() {
		return this.#mouseLevelPos;
	}

	set mouseLevelPos(pos) {
		throw new Error("mouseLevelPos is read only")
	}

//----------------------------//
	get previewAlignToGrid() {
		return this.#previewAlignToGrid;
	}

	set previewAlignToGrid(alignmentChoice) {
		this.#previewAlignToGrid = alignmentChoice;
		this.#updatePreviewAlignment();
	}

//----------------------------//
	get previewVisible() {
		return this.#previewVisible;
	}

	set previewVisible(bool) {
		this.#previewVisible = bool;
		this.#updatePreviewVis();
	}

//-----------------------------//
	set gridVisibility(bool) {
		this.#grid.visible = bool;
	}

//-----------------------------//
	set useShadows(bool) {
		this.#useShadows = bool;
		this.#updateShadowRendering();
		if (bool === true) {
			this.#updateShadowMap(0);
		}
	}

	//-----------------------------//
	set debugShadows(bool) {
		this.#shadowDebug = bool;
		this.#updateShadowDebug();
	}

	//-----------------------------//
	set renderMode(modeString) {
		this.#renderMode = modeString;
		this.#updateRenderMode();

		this.#updatePalette();
	}

	//-----------------------------//
	set palette(index) {
		this.#paletteIndex = index;
		this.#updatePalette();
	}
}




//*******************************Classes****************************************//

class PreviewSprite extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
	}
}