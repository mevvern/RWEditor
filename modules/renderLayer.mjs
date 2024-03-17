import * as PIXI from "./lib/pixi.mjs"
import {Layer} from "./utils.mjs";

export class RenderLayerWithAllSprites extends PIXI.Container {
	/**
	 * 
	 * @param {vec2} levelSize 
	 * @param {number} tileSize 
	*/
	constructor(levelSize, tileSize) {
		//calls the constructor of the parent class, PIXI.Container in this case
		super();

		//Layer object which contains 1 pixi sprite per x,y. has methods for accessing and iterating over each sprite
		this.tiles = new Layer(levelSize, TileSprite)

		//the container which has all of the sprites generated in the previous Layer instance
		this.tileSprites = new TileSprites();

		//the container which will contain prop sprites that aren't tile-based. it is set on top of everything else in the layer
		this.propContainer = new PropContainer();

		//the container which will store the preview sprite for the layer.
		this.previewContainer = new PreviewContainer();

		//the RenderTexture object which renderContainer will be rendered to
		this.renderTexture1 = PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize});
		this.renderTexture2 = PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize});

		//the sprite which will use the rendered texture as its texture. it is to be placed underneath the tile sprites
		this.finalRender = new FinalRender(this.renderTexture1);

		//the container which will contain the rendered layer, as well as the tiles over top of that. the whole container will be rendered to a texture when tile(s) needs to be updated
		this.renderContainer = new RenderContainer();

		//to the renderContainer, this adds the finalRender sprite, and then the tile sprites on top of that
		this.renderContainer.addChild(this.finalRender, this.tileSprites);

		//to this, which is the RenderLayer container, adds renderContainer, and then props container,and then preview container
		this.addChild(this.renderContainer, this.propContainer, this.previewContainer);

		this.finalRender.width = levelSize.x * tileSize;
		this.finalRender.height = levelSize.y * tileSize;

		/*iterate over each tile in the Layer object, initialise its texture to white, 
		set its width and height to the desired tileSize, set its position in pixels, 
		add the sprite to the tileSprites container, and set it to invisible*/
		this.tiles.iterate((tileSprite, pos) => {
			tileSprite.texture = DEFAULT_TEXTURE;
			tileSprite.width = tileSize;
			tileSprite.height = tileSize;
			tileSprite.position.set(pos.x * tileSize, pos.y * tileSize);
			this.tileSprites.addChild(tileSprite);
			tileSprite.visible = false;
		})

		this.tileSprites.visible = false;

		/***********************************************
		 * @param {vec2} pos 
		 * @param {PIXI.Texture} texture 
		 * @function updates the texture of the tile at the desired location
		 */
		this.updateTile = (pos, texture) => {
			const tileSprite = this.tiles.at(pos);

			this.finalRender.texture = this.renderTexture1;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture2});

			tileSprite.texture = texture;
			tileSprite.visible = true;
			this.tileSprites.visible = true;

			this.finalRender.texture = this.renderTexture2;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture1});

			this.finalRender.texture = this.renderTexture1;
			
			tileSprite.visible = false;
			this.tileSprites.visible = false;
		}

		/********************************************************************
		 * @function re-renders the entire layer to the layers render texture. probably not needed, but who knows
		 */
		this.updateLayer = () => {

			this.tiles.iterate((tileSprite) => {
				tileSprite.visible = true;
			})

			this.finalRender.texture = this.renderTexture1;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture2});

			this.finalRender.texture = this.renderTexture2;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture1});

			this.finalRender.texture = this.renderTexture1;

			this.tiles.iterate((tileSprite) => {
				tileSprite.visible = false;
			})
		}

		/**********************************************************************
		 * 
		 * @param {vec2} pos 
		 * @returns 
		 */
		this.at = (pos) => {
			return this.tiles.at(pos);
		}

		this.addPropSprite = (sprite) => {

		}
	}
}

export class RenderLayerWith1Sprite extends PIXI.Container {
	/**
	 * 
	 * @param {vec2} levelSize 
	 * @param {number} tileSize 
	*/
	constructor(levelSize, tileSize) {
		//calls the constructor of the parent class, PIXI.Container in this case
		super();

		//Layer object which contains 1 pixi sprite per x,y. has methods for accessing and iterating over each sprite
		this.tiles = new Layer(levelSize, TileSprite)

		//the container which has all of the sprites generated in the previous Layer instance
		this.tileSprites = new TileSprites();

		//the container which will contain prop sprites that aren't tile-based. it is set on top of everything else in the layer
		this.propContainer = new PropContainer();

		//the container which will store the preview sprite for the layer.
		this.previewContainer = new PreviewContainer();

		//the RenderTexture object which renderContainer will be rendered to
		this.renderTexture1 = PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize});
		this.renderTexture2 = PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize});

		//the sprite which will use the rendered texture as its texture. it is to be placed underneath the tile sprites
		this.finalRender = new FinalRender(this.renderTexture1);

		//the container which will contain the rendered layer, as well as the tiles over top of that. the whole container will be rendered to a texture when tile(s) needs to be updated
		this.renderContainer = new RenderContainer();

		//to the renderContainer, this adds the finalRender sprite, and then the tile sprites on top of that
		this.renderContainer.addChild(this.finalRender, this.tileSprites);

		//to this, which is the RenderLayer container, adds renderContainer, and then props container,and then preview container
		this.addChild(this.renderContainer, this.propContainer, this.previewContainer);

		this.finalRender.width = levelSize.x * tileSize;
		this.finalRender.height = levelSize.y * tileSize;

		/*iterate over each tile in the Layer object, initialise its texture to white, 
		set its width and height to the desired tileSize, set its position in pixels, 
		add the sprite to the tileSprites container, and set it to invisible*/
		this.tiles.iterate((tileSprite, pos) => {
			tileSprite.texture = DEFAULT_TEXTURE;
			tileSprite.width = tileSize;
			tileSprite.height = tileSize;
			tileSprite.position.set(pos.x * tileSize, pos.y * tileSize);
			this.tileSprites.addChild(tileSprite);
			tileSprite.visible = false;
		})

		this.tileSprites.visible = false;

		/***********************************************
		 * @param {vec2} pos 
		 * @param {PIXI.Texture} texture 
		 * @function updates the texture of the tile at the desired location
		 */
		this.updateTile = (pos, texture) => {
			const tileSprite = this.tiles.at(pos);

			this.finalRender.texture = this.renderTexture1;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture2});

			tileSprite.texture = texture;
			tileSprite.visible = true;
			this.tileSprites.visible = true;

			this.finalRender.texture = this.renderTexture2;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture1});

			this.finalRender.texture = this.renderTexture1;
			
			tileSprite.visible = false;
			this.tileSprites.visible = false;
		}

		/********************************************************************
		 * @function re-renders the entire layer to the layers render texture. probably not needed, but who knows
		 */
		this.updateLayer = () => {

			this.tiles.iterate((tileSprite) => {
				tileSprite.visible = true;
			})

			this.finalRender.texture = this.renderTexture1;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture2});

			this.finalRender.texture = this.renderTexture2;

			pixiApp.renderer.render(this.renderContainer, {renderTexture : this.renderTexture1});

			this.finalRender.texture = this.renderTexture1;

			this.tiles.iterate((tileSprite) => {
				tileSprite.visible = false;
			})
		}

		/**********************************************************************
		 * 
		 * @param {vec2} pos 
		 * @returns 
		 */
		this.at = (pos) => {
			return this.tiles.at(pos);
		}

		this.addPropSprite = (sprite) => {

		}
	}
}

class TileSprite extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
		this.textureId = ""
	}
}

class FinalRender extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
	}
}

class TileSprites extends PIXI.Container {
	constructor() {
		super();
	}
}

class PropContainer extends PIXI.Container {
	constructor() {
		super();
	}
}

class RenderContainer extends PIXI.Container {
	constructor() {
		super();
	}
}

class PreviewContainer extends PIXI.Container {
	constructor() {
		super();
	}
}