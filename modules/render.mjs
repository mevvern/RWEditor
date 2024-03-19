import * as PIXI from "./lib/pixi.mjs"; //dont ask me why i did this. i do not want to answer
import {vec2, vec3, vec4, Area, Layer, LINGO} from "./utils.mjs";
import {level} from "./main.mjs";
import {editor} from "./main.mjs";
import {RenderLayerWith1Sprite} from "./renderLayer.mjs"

export class RenderContext {
	constructor(levelSize, tileSize) {
		if (levelSize.x * tileSize > app.renderer.gl.MAX_TEXTURE_SIZE || levelSize.y * tileSize > app.renderer.gl.MAX_TEXTURE_SIZE) {
			//throw new RangeError("level size cannot exceed gl.MAX_TEXTURE_SIZE of " + app.renderer.gl.MAX_TEXTURE_SIZE);
		}

		this.#levelTileSize = levelSize;
		this.#defaultTileSize = tileSize;
		this.#currentTileSize = tileSize;
		this.#levelPixelSize = new vec2(this.#currentTileSize * this.#levelTileSize.x, this.#currentTileSize * this.#levelTileSize.y);

		this.layers = [];
		this.setTileCount = 0;

		this.textures = {DEFAULT : DEFAULT_TEXTURE, WHITE : WHITE, INVISIBLE : INVISIBLE};

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
		}

		/**
		 * 
		 * @param {vec3} pos 
		 * @param {string} textureId 
		 */
		this.setTile = (pos, textureId) => {
			if (pos instanceof vec3) {
				if (textureId in this.textures) {
					const layer = this.layers[pos.z];
					if (textureId !== layer.at(pos).textureId) {
						layer.updateTile(pos, this.textures[textureId]);
						this.setTileCount++
					}
				} else {
					throw new Error("desired texture \"" + textureId + "\" does not exist!");
				}

			} else if (pos instanceof Area) {
				const sortedTiles = [];

				for (const tile of pos) {
					if (!(sortedTiles[tile.pos.z] instanceof Array)) {
						sortedTiles[tile.pos.z] = [];
					}
					tile.texture = this.textures[tile.texture];

					const layer = this.layers[tile.pos.z];

					layer.at(tile.pos).texture = tile.texture

					sortedTiles[tile.pos.z].push(tile);
					this.setTileCount++
				}

				for (const [index, layer] of sortedTiles.entries()) {
					if (layer) {
						const renderLayer = this.layers[index]

						renderLayer.updateTile(layer)
					}
				}

			} else {
				throw new Error("pos must be a vec3 or an Area!!!");
			}
		}
	}


	//------------------------private methods-------------------------//
	

	//---------------pixi inits

	#initWholeThing = () => {
		this.#initGrid();
		this.#initLevelBody();
		this.#initPreview();

		this.#updateViewPos();
		this.#updateViewAngle();
		this.#updateViewDistanceMagnitude();
		//this.#updateSkewMagnitude();
	}

	#initView = () => {
		document.body.appendChild(app.view);
		app.stage.addChild(this.#levelBody);
	}

	#initLevelBody = () => {
		for (const layer of this.layers) {
			layer.destroy({children : true});
		}
		this.layers = [];

		for (let i = 0; i < 30; i++) {
			const layer = new RenderLayerWith1Sprite(this.#levelTileSize, this.#defaultTileSize);
			layer.pivot.set(layer.width / 2, layer.height / 2);
			layer.tileSprite.tint = [i / 30, i / 30, i / 30];
			//layer.updateLayer();
			//layer.alpha = 0.1
			this.layers.unshift(layer);
			this.#levelBody.addChild(layer);
		}

		//set pivot of the level body to half the width and height of itself. the center
		for (const layer of this.layers) {
			//layer.pivot.set(layer.width * this.layerOrigin.x, layer.height * this.layerOrigin.y)
		}

		this.#levelBody.addChild(this.#grid);
	}

	#initPreview = () => {
		this.#preview = [];
		for (const [depth, layer] of this.layers.entries()) {
			const sprite = new PreviewSprite();
			sprite.texture = DEFAULT_TEXTURE;
			sprite.tint = [(30 - depth) / 30, (30 - depth) / 30, (30 - depth) / 30]
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

	//--------------texture inits-----------------------------------------------------------------

	#getTexInits = () => {
		let LONString = "";
		this.#texInits = LINGO.parse(LONString)
	}
	
	#getTexture = (textureId, type) => {
		//type can be tile, prop, or geometry
		switch (type) {
			default:
				throw new Error("type must be tile, prop, or geometry!");

			break
			case "geometry":
				return PIXI.Texture.fromUrl("../resources/render/geometry/" + textureId + ".png");

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

		const scaleFac = this.#defaultTileSize / this.#currentTileSize

		screenPos.x = (pos.x / scaleFac) + this.#levelOrigin.x;
		screenPos.y = (pos.y / scaleFac) + this.#levelOrigin.y;

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

	#updateViewPos = () => {
		this.#levelBody.position.set(this.#viewPos);

		this.#levelOrigin.x = this.#viewPos.x - (this.#levelPixelSize.x / 2);
		this.#levelOrigin.y = this.#viewPos.y - (this.#levelPixelSize.y / 2);

		this.#updateMouseScreenPos();
	}

	#updateViewSize = () => {
		this.#currentTileSize = this.#defaultTileSize + this.#viewSize;
		this.#levelPixelSize = new vec2(this.#currentTileSize * this.#levelTileSize.x, this.#currentTileSize * this.#levelTileSize.y);
		this.#levelBody.width = this.#levelPixelSize.x;
		this.#levelBody.height = this.#levelPixelSize.y;


		this.#levelOrigin.x = this.#viewPos.x - (this.#levelPixelSize.x / 2);
		this.#levelOrigin.y = this.#viewPos.y - (this.#levelPixelSize.y / 2);

		this.#updateMouseScreenPos();
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
		let x = Math.cos(Math.PI * this.#viewAngle); ////RADIANS!!!!!!!
		let y = Math.sin(Math.PI * this.#viewAngle);
		x *= this.viewAngleMagnitude; 
		y *= this.viewAngleMagnitude;

		for (const [depth, layer] of this.layers.entries()) {
			layer.position.set(x * depth, y * depth);
		}
	}

	#updateViewAngleMagnitude = () => {
		this.#updateViewAngle();
	}

	#updateSkewAngle = () => {
		for (const layer of this.layers) {
			layer.skew.set(0.1, 0);
		}
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
		//this.#updateSkewAngle();
	}

	#updateViewDistanceMagnitude = () => {
		for (const [depth, layer] of this.layers.entries()) {
			const depthMod = depth * this.#depthMagnitude
			layer.scale.set(((100 - depthMod) / 100));
		}
	}

	#updateMouseScreenPos = () => {
		this.#mouseLevelPos = this.#screenToLevel(this.#mouseScreenPos)
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

	#updateShadowMaps = (editDepth) => {
		
		for (const [layerCount, layer] of this.layers.entries()) {
			const shadowTex = 8
		}
	}

	//----------------------private properties------------------------//

	#mouseScreenPos = new vec3();				//the position of the mouse cursor in screen space
	#mouseLevelPos = new vec3()					//the position of the mouse cursor in level space
	#levelOrigin = new vec2();					//the position of the top left corner of the level in screen space

	#previewAlignToGrid = "coarse";			//the level to which the preview should be aligned to the grid
	#previewVisible = true;
	
	#viewPos = new vec2(1000, 500);				//position of the view in screen space. the origin of the level is in its center
	#viewSize = 0;								//change in size of each tile from the default tile size of 20
	#layerVisibility = [1, 1, 1];	//visibility of each "ui" layer
	#levelPixelSize;							//current size of the level in pixels
	#currentTileSize;							//current size of each tile in pixels
	#viewAngle = 0.5;							//the current "viewing angle" of the level in pi radians. in reality, it's the direction to move each layer to give a fake viewing angle
	#viewAngleMagnitude = 0;			//the distance which each layer will move when offset by the angle	
	#depthMagnitude = 0.4;				//how "far" the layers should be from each other. max is 3.333. in reality this controls how much each layer gets scaled down to provide a fake perspective effect
	#skewAngle = 1;								//the angle with which to skew the vertices of the level. RADIANS!!!!
	#skewMagnitude = 50;					//how far that skew operation will go in that angle

	#previewTexId;								//id of the texture which should be assigned to the preview indicator
	
	#levelTileSize = new vec2();	//size of the level in tiles
	#defaultTileSize;							//default size of each tile
	#currentMode = "geometry"			//current viewing mode of the renderer
	#texInits = {}								//the texture init files taken from the original editor. parsed from a lingo object to a javascript object

	#levelBody = new PIXI.Container();
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

	set previewAlignToGrid(bool) {
		this.#previewAlignToGrid = bool;
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
}





//*******************************Classes****************************************//

class PreviewSprite extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
	}
}