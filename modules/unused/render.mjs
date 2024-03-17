import * as PIXI from "../lib/pixi.mjs"; //dont ask me why i did this. i do not want to answer
//import * as PIXI from "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.3/pixi.min.mjs"; 
import {vec2, vec3, vec4} from "../utils.mjs";
import {level} from "../main.mjs";
import {editor} from "../main.mjs";
import {Area, Layer} from "../level.mjs";

export class RenderContext {
	constructor(defaultTileSize, levelSize) {
		this.#levelSize = levelSize;
		this.#defaultTileSize = defaultTileSize;

		this.app = new PIXI.Application({background : "#7788af", resizeTo : window});
		globalThis.__PIXI_APP__ = this.app;

		this.viewPos = new vec2(Math.floor(this.app.view.width / 2), Math.floor(this.app.view.height / 2));

		this.#appendToDocument();

		this.#initView();

		this.setGeo = (pos, newGeo) => {
			if (pos instanceof vec3) {
				const tile = this.#tiles[pos.z][pos.x][pos.y];

				tile.texture = this.#textures[newGeo];

				switch (pos.z) {
					case 0:
						tile.tint = [0, 0, 0];
					break
					case 1:
						tile.tint = [0, 1, 0];
					break
					case 2:
						tile.tint = [1, 0, 0];
					break
				}
			} else {
				throw new TypeError("position must be an instance of vec3! {x: x, y: y, z: layer}")
			}
		}
	}
	
	//private methods 

	#appendToDocument = () => {
		document.body.appendChild(this.app.view);
		this.app.stage.addChild(this.#root);
		this.#root.addChild(this.#levelContainer, this.#tilePreview);
		this.#levelContainer.addChild(this.#background, this.#level, this.#grid);
	}

	#initView = async () => {
		await this.#initTextures();

		this.#initLevelContainer();
		this.#initBackground();
		this.#initLevel();
		this.#initPreview();
		this.#initGrid();

		this.#updateLevelScale();
		this.#updateLevelPos();
	}

	#initLevelContainer = () => {
		const levelContainer = this.#levelContainer;
		levelContainer.pivot.set((this.#levelSize.x * this.#defaultTileSize) / 2, (this.#levelSize.y * this.#defaultTileSize) / 2);
	}

	#initGrid = () => {
		this.#grid.texture = this.#textures["grid"];
		this.#grid.tileScale.set(0.1);
		this.#grid.width = this.#levelSize.x * this.#defaultTileSize;
		this.#grid.height = this.#levelSize.y * this.#defaultTileSize;
		this.#grid._cacheAsBitmapResolution = 4;
	}

	#initPreview = () => {
		const outline = new PIXI.Sprite(this.#textures["preview outline"]);
		outline.width = this.defaultTileSize;
		outline.height = this.defaultTileSize;
		outline.tint = [0.4, 1, 1];
		this.#previewSprite.texture = this.#textures.wall;
		this.#tilePreview.addChild(this.#previewSprite, outline);
		this.#tilePreview.visible = false;
	}

	#initBackground = () => {
		this.#background.width = this.#levelSize.x * this.#defaultTileSize;
		this.#background.height = this.#levelSize.y * this.#defaultTileSize;
	}
	
	#initLevel = () => {
		this.#initLevelSprites();
	}

	#updateLevelPos = () => {
		const levelContainer = this.#levelContainer
		levelContainer.position.x = this.viewPos.x;
		levelContainer.position.y = this.viewPos.y;

		this.#levelOrigin.x = this.viewPos.x - ((this.#levelSize.x * (this.#defaultTileSize + this.#viewSize)) / 2);
		this.#levelOrigin.y = this.viewPos.y - ((this.#levelSize.y * (this.#defaultTileSize + this.#viewSize)) / 2);
	}

	#updateLevelScale = () => {
		const levelContainer = this.#levelContainer

		if (this.viewSize < -18) {
			this.viewSize = -18;
		}

		if (this.viewSize < -10) {
			this.#grid.visible = false;
			//this.#refreshBitmap();
		} else {
			this.#grid.visible = true;
			//this.#refreshBitmap();
		}

		levelContainer.width = this.#levelSize.x * (this.#defaultTileSize + this.viewSize);
		levelContainer.height = this.#levelSize.y * (this.#defaultTileSize + this.viewSize);

		this.#levelOrigin.x = this.viewPos.x - ((this.#levelSize.x * (this.#defaultTileSize + this.#viewSize)) / 2);
		this.#levelOrigin.y = this.viewPos.y - ((this.#levelSize.y * (this.#defaultTileSize + this.#viewSize)) / 2);
	}

	#updatePreviewPos = () => {
		const origin = this.levelOrigin;
		const tileSize = this.#defaultTileSize + this.#viewSize;
		const indicator = this.#previewSprite;
		const pos = this.previewPos;

		this.#tilePreview.position.set(origin.x + (pos.x * tileSize), origin.y + (pos.y * tileSize));
		
		switch (pos.z) {
			case 0:
				indicator.tint = [0, 0, 0];
				indicator.alpha = 0.8;
			break
			case 1:
				indicator.tint = [0, 1, 0];
				indicator.alpha = 0.9;
			break
			case 2:
				indicator.tint = [1, 0, 0];
				indicator.alpha = 1;
			break
		}
	}

	#updatePreviewScale = () => {
		const tileSize = this.#defaultTileSize + this.#viewSize;
		this.#tilePreview.width = tileSize;
		this.#tilePreview.height = tileSize;
	}

	#updateLayerVisibility = () => {
		this.#layerVisibility.forEach((layerVisChoice, index) => {
			this.#level.children[index].visible = layerVisChoice;
		})
	}

	#refreshBitmap = () => {
		if (this.cacheAsBitmap === true) {
			this.cacheAsBitmap = false;
			this.cacheAsBitmap = true;
		}
	}

	#initLevelSprites = () => {
		for (let layer = 2; layer >= 0; layer--) {
			this.#tiles[layer] = (new Layer(this.#levelSize, PIXI.Sprite));
			this.#level.addChild(new PIXI.Container());
			console.log(layer);

			for (let x = 0; x < this.#levelSize.x; x++) {
				for (let y = 0; y < this.#levelSize.y; y++) {
					const pos = new vec3(x, y, layer);
					const tileSprite = this.#tiles[layer][x][y];

					//init the tiles to mirror the tile types in the level, useful if the level already contains shit
					tileSprite.texture = this.#textures[level.tileAt(pos).geometry]
					tileSprite.textureName = level.tileAt(pos).geometry;

					tileSprite.anchor.set(0.5)
					//tileSprite.pivot.set(10, 10);
					tileSprite.position.set((x * this.#defaultTileSize) + 10, (y * this.#defaultTileSize) + 10);
					tileSprite.width = this.#defaultTileSize;
					tileSprite.height = this.#defaultTileSize;
	
					this.#level.children[layer].addChild(tileSprite);
				}
			}
		}
	}

	#initTextures = async () => {
		this.#textures["grid"] = await PIXI.Texture.fromURL("../resources/render/generic/gridCellThick.png");
		this.#textures["preview outline"] = await PIXI.Texture.fromURL("../resources/render/generic/preview outline.png");
		this.#textures["default"] = await PIXI.Texture.fromURL("../resources/render/generic/default.png");
		
		for (const tileName of editor.currentMode.tileSet) {
			if (tileName instanceof Array) {
				for (const [index, id] of tileName.entries()) {
					if (index !== 0) {
						this.#textures[id] = await PIXI.Texture.fromURL("../resources/render/geometry/" + id + ".png");
					}
				}

			} else {
				this.#textures[tileName] = await PIXI.Texture.fromURL("../resources/render/geometry/" + tileName + ".png");
			}
		}
	}

	//private properties
	#viewSize = 0;
	#viewPos = new vec2();
	#levelSize = new vec2();
	#defaultTileSize;
	#previewPos = new vec3();
	#previewTex = null;
	#layerVisibility = [1, 1, 1];
	#levelOrigin = new vec2();
	
	//textures
	#textures = [];
	
	//pixi objects
	#root = new PIXI.Container();
	#levelContainer = new PIXI.Container();
	#background = new PIXI.Sprite(PIXI.Texture.WHITE);
	#level = new PIXI.Container();
	#grid = new PIXI.TilingSprite(PIXI.Texture.WHITE);
	#tilePreview = new PIXI.Container();
	#previewSprite = new PIXI.Sprite(PIXI.Texture.WHITE);

	//organized sprite storage
	#tiles = []

	//setters and getters
	set viewSize(size) {
		this.#viewSize = size;
		this.#updateLevelScale();
		this.#updatePreviewScale();
		this.#updatePreviewPos();
	}

	get viewSize() {
		return this.#viewSize;
	}


	set viewPos(pos) {
		this.#viewPos = pos;
		this.#updateLevelPos();
		this.#updatePreviewPos();
	}

	get viewPos() {
		return this.#viewPos
	}


	set preview(choice) {
		this.#previewSprite.texture = this.#textures[choice];
		this.#previewTex = choice;
	}

	get preview() {
		return this.#previewTex;
	}


	set previewPos(pos) {
		this.#previewPos = pos;
		this.#updatePreviewPos();
	}

	get previewPos() {
		return this.#previewPos;
	}

	set layerVisibility(visArr) {
		this.#layerVisibility = visArr;
		this.#updateLayerVisibility();
	}

	get layerVisibility() {
		return this.#layerVisibility;
	}

	get levelOrigin() {
		return this.#levelOrigin;
	}

	get defaultTileSize() {
		return this.#defaultTileSize;
	}

	set cacheAsBitmap(bool) {
		this.#levelContainer.cacheAsBitmap = bool;
	}

	get cacheAsBitmap() {
		return this.#levelContainer.cacheAsBitmap;
	}

	set previewVis(bool) {
		this.#tilePreview.visible = bool;
	}

	get previewVis() {
		return this.#tilePreview.visible;
	}
}