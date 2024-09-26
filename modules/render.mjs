import * as PIXI from "./lib/pixi.mjs"; //dont ask me why i did this. i do not want to answer
import * as projection from "./lib/pixi-projection.mjs"
import {vec2, vec3, vec4, Area, Layer, LINGO, getShader, generateFrame} from "./utils.mjs";
import {level} from "./main.mjs";
import {editor} from "./main.mjs";
import {RenderLayerWith1Sprite} from "./renderLayer.mjs"
import {ButtonOptions} from "./ui.mjs";
import {MaterialAssetParser} from "./MaterialAssetParsing.mjs";


//renderer more like FUCKERer

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
			if (tileList instanceof Array) {
				//convert list of Level Space tiles (3 depths) to Render Space tiles (30 depths)
				const spriteList = [];

				for (const tile of tileList) {
					if (!(tile.materialId in this.materials)) {
						console.warn(`material "${tile.materialId}" does not exist! applied default material of "missing"`);
						tile.materialId = "missing";
					}

					const material = this.materials[tile.materialId];

					for (const [index, layer] of material.variants[tile.variant][tile.geometryId].layers.entries()) {
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
							case "cool scug":
								sprite.texture = material.variants[tile.variant][tile.geometryId].textures[tile.option][layer];
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

		this.setPreview = (materialId, variantIndex, depth, tileType, isRandom = false) => {
			console.log(`setting cursor to: material "${materialId}" | variant ${variantIndex} | tile type "${tileType}" | depth ${depth}`);

			if (tileType === "air") {
				return;
			}

			const tile = this.materials[materialId].variants[variantIndex][tileType];

			const textures = [];

			for (const layer of tile.layers) {
				textures.push(tile.textures[0][layer]);
			}

			for (const previewSprite of this.#preview) {
				previewSprite.texture = cursorTex;
			}

			for (const [index, texture] of textures.entries()) {
				const targetLayer = index + (depth * 10);
				const previewSprite = this.#preview[targetLayer];

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
		await this.#getPalettes();
		this.#updateViewPos();
		this.#updateViewDistance();
		this.#updateShadowParams();
		this.#updateSkew();

		const materialStartTime = Date.now();
		const finishedMaterialsArray = await Promise.all(await MaterialAssetParser.initMaterials());
		const finishedMaterialsObject = {}
		for (const material of finishedMaterialsArray) {
			finishedMaterialsObject[material.id] = material;
		}
		this.materials = finishedMaterialsObject;
		console.log(`took ${(Date.now() - materialStartTime) / 1000} seconds to load materials`);

		console.log(this.materials);

		this.setPreview("x metal", 0, 0, "wall");
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
		const gridTex = await PIXI.Texture.fromURL("./resources/editorGraphics/gridCellThick.png");
		const borderTex = await PIXI.Texture.fromURL("./resources/editorGraphics/levelOutline.png");

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
		const startTime = Date.now();
		//hardcoded palette count for now
		const paletteCount = 37;

		for (let i = 0; i < paletteCount; i++) {
			PIXI.Texture.fromURL("./resources/palettes/palette" + i + ".png").then((palette) => {
				palette.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
				this.palettes.push(palette);
				if (i + 1 === paletteCount) {
					console.log(`took ${(Date.now() - startTime) / 1000} seconds to load palettes`);
				}
			})
		}

		this.palette = 1;
	}

	//--------------shaders----------------------------------------------------------------



	//---------------------utils-----------------------------------------------------------------

	#generateTestTiles = (materialId) => {
		for (let i = 0; i < 30; i++) {
			const tile = {};

			tile.pos = new vec3(5, i + 1, i);
			tile.texture = this.materials[materialId].variants[0]["wall"].textures[0][2];

			this.layers[i].updateTile([tile]);
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
		for (const [uiLayer, visChoice] of this.#layerVisibility.entries()) {
			for (let i = uiLayer * 10; i < (uiLayer + 1) * 10; i++) {
				this.layers[i].visible = visChoice;
				console.log("hidden ui layer " + uiLayer + " || real layer " + i)
			}
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
	#previewTile = "wall";
	#previewMaterial = "bricks";
	#previewDepth = 0;
	#previewVariant = 0;

	#useShadows = true;
	#shadowDebug = false;
	#renderMode = "finalRender";
	#paletteIndex = 0;

	#viewPos = new vec2();				//position of the view in screen space. the origin of the level is in its center
	#viewSize = 0;								//change in size of each tile from the default tile size of 20
	#layerVisibility = [true, true, true];	//visibility of each "ui" layer
	#levelPixelSize;							//current size of the level in pixels
	#currentTileSize = DEFAULT_TILE_SIZE;				//current size of each tile in pixels
	#depthMagnitude = 0.4;				//how "far" the layers should be from each other. max is 3.333. in reality this controls how much each layer gets scaled down to provide a fake perspective effect
	#skewAngle = 1;								//the angle with which to skew the vertices of the level. RADIANS!!!!
	#skewMagnitude = 50;					//how far that skew operation will go in that angle
	#shadowParams = [0.8462, 0.002]; //shadow parameters for the level. first entry is the angle, second entry is the magnitude
	
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
		console.log("layervis")
	}

	get layerVis() {
		return this.#layerVisibility
	}

//----------------------------//

	set previewTile(tileType) {
		this.#previewTile = tileType;
		this.setPreview(this.#previewMaterial, this.#previewVariant, this.#previewDepth, this.#previewTile);
	}

	set previewMaterial(material) {
		this.#previewMaterial = material;
		this.setPreview(this.#previewMaterial, this.#previewVariant, this.#previewDepth, this.#previewTile);
	}

	set previewVariant(variant) {
		this.#previewVariant = variant;
		this.setPreview(this.#previewMaterial, this.#previewVariant, this.#previewDepth, this.#previewTile);
	}

	set previewDepth(depth) {
		this.#previewDepth = depth;
		this.setPreview(this.#previewMaterial, this.#previewVariant, this.#previewDepth, this.#previewTile);
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