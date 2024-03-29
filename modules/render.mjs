import * as PIXI from "./lib/pixi.mjs"; //dont ask me why i did this. i do not want to answer
import * as projection from "./lib/pixi-projection.mjs"
import {vec2, vec3, vec4, Area, Layer, LINGO} from "./utils.mjs";
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

		this.#initView();

		this.#initWholeThing();

		this.testSprite = new PIXI.Sprite();
		this.testSprite.width = this.#levelPixelSize.x / 4;
		this.testSprite.height = this.#levelPixelSize.y / 4;

		app.stage.addChild(this.testSprite);

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
		 * @param {string} textureId 
		 */
		this.setTile = (tileList) => {
			if (tileList instanceof Array) {
				
					const sortedTiles = [];
					let highestLayer = 29;

					for (const tile of tileList) {
						if (tile.texture in this.textures) {	
							if (!(sortedTiles[tile.pos.z] instanceof Array)) {
								sortedTiles[tile.pos.z] = [];
							}
							tile.texture = this.textures[tile.texture];
		
							sortedTiles[tile.pos.z].push(tile);

						} else {
							console.warn("desired texture \"" + tile.texture + "\" does not exist!");
						}
					}

					for (const [index, layer] of sortedTiles.entries()) {
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

	}
	//------------------------privates-------------------------------//
	

	//---------------pixi inits

	#initWholeThing = async () => {
		this.#initGrid();
		this.#initLevelBody();
		this.#initCamera();
		this.#initPreview();

		this.#updateViewPos();
		this.#updateViewAngle();
		this.#updateViewDistanceMagnitude();
		this.#updateSkewMagnitude();

		await this.#getGeoTextures();
	}

	#initView = () => {
		document.body.appendChild(app.view);
		app.stage.addChild(this.#camera);
	}

	#initLevelBody = () => {
		for (const layer of this.layers) {
			layer.destroy({children : true});
		}
		this.layers = [];

		for (let i = 0; i < 30; i++) {
			const layer = new RenderLayerWith1Sprite(this.#levelTileSize, new vec2(1.81, 0.001));

			layer.position3d.set((-this.#defaultTileSize * this.#levelTileSize.x) / 2, (-this.#defaultTileSize * this.#levelTileSize.y) / 2, (29 - i) * 10);

			layer.pivot3d.set(0);
			layer.pivot.set(0);

			layer.tileSprite.tint = [(70 - i) / 70, (70 - i) / 70, (70 - i) / 70];

			this.layers.unshift(layer);
			this.#levelBody.addChild(layer);

			//console.log(this.#levelBody.scale3d);
		}
	
		this.#levelBody.addChild(this.#grid);

		//this.#levelBody.euler.roll = 0.1;
	}

	#initCamera = () => {
		this.#camera.setPlanes(3000, 0.1, 1000, false); //focus plane, near plane, far plane, orthographic boolean
		this.#camera.position.set(this.#screenCenter);
		this.#camera.addChild(this.#levelBody);
	}

	#initPreview = () => {
		this.#preview = [];
		for (const [depth, layer] of this.layers.entries()) {
			const sprite = new PreviewSprite();
			sprite.texture = DEFAULT_TEXTURE;
			sprite.tint = [(30 - depth) / 30, (30 - depth) / 30, (30 - depth) / 30];
			//sprite.alpha = 0.5;
			sprite.width = this.#defaultTileSize;
			sprite.height = this.#defaultTileSize;
			//sprite.position.set(100, 100);
			this.#preview.push(sprite);
			layer.previewContainer.addChild(sprite);
		}
	}

	#initGrid = async() => {
		this.#grid = new PIXI.TilingSprite();
		const tex = await PIXI.Texture.fromURL("../resources/render/generic/gridCellThick.png")

		this.#grid.texture = tex;
		this.#grid.width = this.#levelPixelSize.x;
		this.#grid.height = this.#levelPixelSize.y;
		this.#grid.pivot.set(this.#levelPixelSize.x / 2, this.#levelPixelSize.y / 2)
		this.#grid.tileScale.set(0.1)
	}

	//--------------textures-----------------------------------------------------------------

	#getTexInits = () => {
		let LONString = "";
		this.#texInits = LINGO.parse(LONString)
	}
	
	#getGeoTextures = async () => {
		const tileList = editor.modes.geometry.tileSet;

		for (const buttonOption of tileList) {
			if (buttonOption instanceof ButtonOptions) {
				for (const geoId of buttonOption.metaData.textures) {
					const tex = await this.#getTexture(geoId, "geometry");
					this.textures[geoId] = tex;
				}
			} else {
				const tex = await this.#getTexture(buttonOption, "geometry");
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

	#updateLayerUniforms = () => {
		for (const layer of this.layers) {
			layer.levelOrigin = this.#levelOrigin;
			layer.levelSize = this.#levelPixelSize;
		}
	}

	#updateShadowMap = (highestLayer) => {
		if (this.#useShadows) {
			if (typeof highestLayer === "number") {
				const range = new vec2(highestLayer + 1, 29);
	
				for (let layerNumber = range.x; layerNumber <= range.y; layerNumber++) {
	
					if (layerNumber != 0) {
						const map = this.layers[layerNumber - 1].getShadowMap();
						this.testSprite.texture = map;
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
		this.#updateLayerUniforms();
	}

	#updateViewSize = () => {
		if (this.#viewSize < -this.#defaultTileSize + 2) {
			this.#viewSize = -this.#defaultTileSize + 1;
		}

		const scaleFac = this.#defaultTileSize / this.#currentTileSize

		this.#currentTileSize = this.#defaultTileSize + this.#viewSize;
		this.#levelPixelSize = new vec2(this.#currentTileSize * this.#levelTileSize.x, this.#currentTileSize * this.#levelTileSize.y);
		this.#levelBody.scale.set(this.currentTileSize / this.#defaultTileSize);

		this.#levelOrigin = this.#levelToScreen(new vec2());

		this.#updateViewPos();
		this.#updateMouseScreenPos();
		this.#updateLayerUniforms();
	}

	#updateLayerVisibility = () => {
		for (const [visChoice, uiLayer] of this.#layerVisibility.entries()) {
			for (let i = uiLayer * 10; i < (uiLayer + 1) * 10; i++) {
				this.layers[i].visible = visChoice;
			}
		}
	}

	#updatePreviewTexture = () => {
		//VERY COMPLICATED HERE I DONT WANNA THINK ABOUT IT
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

		for (const previewSprite of this.#preview) {
			previewSprite.position.set(pos);
		}
	}

	#updateViewAngle = () => {
		console.log("viewangle is unused")
		/* let x = Math.cos(Math.PI * this.#viewAngle); ////RADIANS!!!!!!!
		let y = Math.sin(Math.PI * this.#viewAngle);
		x *= this.viewAngleMagnitude; 
		y *= this.viewAngleMagnitude;

		for (const [depth, layer] of this.layers.entries()) {
			layer.position.set(x * depth, y * depth);
		} */
	}

	#updateViewAngleMagnitude = () => {
		console.log("viewangle magnitude is unused");
		this.#updateViewAngle();
	}

	#updateSkewAngle = () => {
		console.log("skewangle is unused");
		/* let x = Math.cos(Math.PI * this.#skewAngle); ////RADIANS!!!!!!!
		let y = Math.sin(Math.PI * this.#skewAngle);
		x *= this.#skewMagnitude; 
		y *= this.#skewMagnitude;
		//x += this.#viewSize;
		//y += this.#viewSize;

		for (const layer of this.layers) {
			layer.finalRender.vertexData[0] += x;
			layer.finalRender.vertexData[1] += y;
			layer.finalRender.vertexData[2] += x;
			layer.finalRender.vertexData[3] += y;
		} */
	}

	#updateSkewMagnitude = () => {
		console.log("skewmagnitude is unused");
		//this.#updateSkewAngle();
	}

	#updateViewDistanceMagnitude = () => {
		console.log("viewdistance is unused");
		/* for (const [depth, layer] of this.layers.entries()) {
			const depthMod = depth * this.#depthMagnitude
			layer.scale.set(((100 - depthMod) / 100));
		} */
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

	#updateShadowRendering = () => {
		for (const layer of this.layers) {
			layer.filters[0].enabled = this.#useShadows;
		}
	}

	//----------------------private properties------------------------//

	#mouseScreenPos = new vec3();				//the position of the mouse cursor in screen space
	#mouseLevelPos = new vec3()					//the position of the mouse cursor in level space
	#levelOrigin = new vec2();					//the position of the top left corner of the level in screen space

	#previewAlignToGrid = "none";			//the level to which the preview should be aligned to the grid
	#previewVisible = true;
	#useShadows = true;
	
	#viewPos = new vec2();				//position of the view in screen space. the origin of the level is in its center
	#viewSize = 0;								//change in size of each tile from the default tile size of 20
	#layerVisibility = [1, 1, 1];	//visibility of each "ui" layer
	#levelPixelSize;							//current size of the level in pixels
	#currentTileSize = DEFAULT_TILE_SIZE;				//current size of each tile in pixels
	#viewAngle = 0.5;										//the current "viewing angle" of the level in pi radians. in reality, it's the direction to move each layer to give a fake viewing angle
	#viewAngleMagnitude = 0;			//the distance which each layer will move when offset by the angle	
	#depthMagnitude = 0.4;				//how "far" the layers should be from each other. max is 3.333. in reality this controls how much each layer gets scaled down to provide a fake perspective effect
	#skewAngle = 1;								//the angle with which to skew the vertices of the level. RADIANS!!!!
	#skewMagnitude = 50;					//how far that skew operation will go in that angle

	#previewTexId;								//id of the texture which should be assigned to the preview indicator
	
	#levelTileSize = new vec2();					//size of the level in tiles
	#screenCenter;												//stores the center of the screen at init
	#defaultTileSize = DEFAULT_TILE_SIZE; //the default tile size in pixels
	#currentMode = "geometry"							//current viewing mode of the renderer
	#texInits = {}												//the texture init files taken from the original editor. parsed from a lingo object to a javascript object

	#levelBody = new projection.Container3d();
	#camera = new projection.Camera3d();
	#preview = [];
	#grid = new PIXI.TilingSprite();
	
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
	set previewTexture(textureId) {
		this.#previewTexId = textureId;
		this.#updatePreviewTexture();
	}

	get previewTexture() {
		return this.#previewTexId
	}

//----------------------------//
	set viewAngle(angle) {
		this.#viewAngle = angle;
		this.#updateViewAngle();
	}

	get viewAngle() {
		return this.#viewAngle;
	}

//----------------------------//
	set viewAngleMagnitude(magnitude) {
		this.#viewAngleMagnitude = magnitude;
		this.#updateViewAngleMagnitude();
	}

	get viewAngleMagnitude() {
		return this.#viewAngleMagnitude;
	}

//----------------------------//
	set depthMagnitude(magnitude) {
		this.#depthMagnitude = magnitude;
		this.#updateViewDistanceMagnitude();
	}

	get depthMagnitude() {
		return this.#depthMagnitude;
	}

//----------------------------//
	set skewAngle(angle) {
		this.#skewAngle = angle;
		this.#updateSkewAngle();
	}

	get skewAngle() {
		return this.#skewAngle;
	}

//----------------------------//
	set skewMagnitude(magnitude) {
		this.#skewMagnitude = magnitude;
		this.#updateSkewMagnitude();
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
}



//*******************************Classes****************************************//

class PreviewSprite extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
	}
}