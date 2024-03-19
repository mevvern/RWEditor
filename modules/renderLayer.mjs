import * as PIXI from "./lib/pixi.mjs"
import {Layer} from "./utils.mjs";

export class RenderLayerWith1Sprite extends PIXI.Container {
	/**
	 * 
	 * @param {vec2} levelSize 
	 * @param {number} tileSize 
	*/
	constructor(levelSize, tileSize) {
		//calls the constructor of the parent class, PIXI.Container in this case
		super();

		this.#defaultTileSize = tileSize;

		//Layer object which contains 1 pixi sprite per x,y. has methods for accessing and iterating over each sprite
		this.tiles = new Layer(levelSize, TileData)

		//the container which has all of the sprites generated in the previous Layer instance
		this.tileSprite = new TileSprite();

		//the container which will contain prop sprites that aren't tile-based. it is set on top of everything else in the layer
		this.propContainer = new PropContainer();

		//the container which will store the preview sprite for the layer.
		this.previewContainer = new PreviewContainer();

		//the RenderTexture object which renderContainer will be rendered to
		this.renderTextures = [PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize}), PIXI.RenderTexture.create({width : levelSize.x * tileSize, height : levelSize.y * tileSize})]

		//the sprite which will use the rendered texture as its texture. it is to be placed underneath the tile sprites
		this.finalRender = new FinalRender(this.renderTexture1);

		//the container which will contain the rendered layer, as well as the tiles over top of that. the whole container will be rendered to a texture when tile(s) needs to be updated
		this.renderContainer = new RenderContainer();

		//to the renderContainer, this adds the finalRender sprite, and then the tile sprites on top of that
		this.renderContainer.addChild(this.finalRender, this.tileSprite);

		//to this, which is the RenderLayer container, adds renderContainer, and then props container,and then preview container
		this.addChild(this.renderContainer, this.propContainer, this.previewContainer);

		this.finalRender.width = levelSize.x * tileSize;
		this.finalRender.height = levelSize.y * tileSize;

		
		this.tileSprite.texture = DEFAULT_TEXTURE;
		this.tileSprite.width = tileSize;
		this.tileSprite.height = tileSize;
		this.tileSprite.visible = false;

		/***********************************************
		 * updates the texture of the tile at the desired location or set of locations
		 * @param {PIXI.Texture} texture 
		 */
		this.updateTile = (pos, texture) => {
			const tileSprite = this.tileSprite;
			const renderTextures = this.renderTextures

			this.finalRender.texture = this.renderTextures[this.#renderedIndex];

			if (pos instanceof Array) {
				for (const tile of pos) {
					tileSprite.visible = true;

					//console.log(this.tiles.at(tile.pos), tile.pos)

					if (this.tiles.at(tile.pos).texture.id !== tile.texture.id) {
						tile.pos.x *= this.#defaultTileSize;
						tile.pos.y *= this.#defaultTileSize;

						tileSprite.position.set(tile.pos);
						tileSprite.texture = tile.texture;
						
			
						app.renderer.render(this.renderContainer, {renderTexture : renderTextures[this.#bufferIndex]});
	
						this.finalRender.texture = this.renderTextures[this.#bufferIndex];
	
						if (this.#bufferIndex === 1) {
							this.#bufferIndex = 0;
							this.#renderedIndex = 1;
						} else {
							this.#bufferIndex = 1;
							this.#renderedIndex = 0;
						}
					}
				}

				tileSprite.visible = false;

			} else {
				this.finalRender.texture = this.renderTextures[this.#renderedIndex];

				tileSprite.position.set(pos);
				tileSprite.texture = texture;
				tileSprite.visible = true;

				app.renderer.render(this.renderContainer, {renderTexture : this.renderTextures[this.#bufferIndex]});
	
				this.finalRender.texture = this.renderTextures[this.#bufferIndex];

				tileSprite.visible = false;

				if (this.#bufferIndex === 1) {
					this.#bufferIndex = 0;
					this.#renderedIndex = 1;
				} else {
					this.#bufferIndex = 1;
					this.#renderedIndex = 0;
				}
			}
		}

		/**
		 * clears the layer's render textures
		 */

		this.clearRenderTextures = () => {
			this.tileSprite.visible = false;

			this.finalRender.visible = false;

			app.renderer.render(this.renderContainer, {renderTexture : this.renderTextures[1], clear : true});
			app.renderer.render(this.renderContainer, {renderTexture : this.renderTextures[0], clear : true});

			this.finalRender.visible = true;
		}

		/**
		 * clears and then renders the whole layer
		 */

		this.renderAll = () => {
			const tileSprite = this.tileSprite;
			const renderTextures = this.renderTextures;

			tileSprite.visible = true;

			this.clearRenderTextures();

			this.tiles.iterate((tile, pos) => {
				tileSprite.visible = true;
				if (tile.texture.id !== "INVISIBLE") {
					pos.x *= this.#defaultTileSize;
					pos.y *= this.#defaultTileSize;

					tileSprite.texture = tile.texture;

					tileSprite.position.set(pos);

					app.renderer.render(this.renderContainer, {renderTexture : renderTextures[this.#bufferIndex]});

					this.finalRender.texture = this.renderTextures[this.#bufferIndex];

					if (this.#bufferIndex === 1) {
						this.#bufferIndex = 0;
						this.#renderedIndex = 1;
					} else {
						this.#bufferIndex = 1;
						this.#renderedIndex = 0;
					}
				}
			})
			tileSprite.visible = false;
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

	#bufferIndex = 1;
	#renderedIndex = 0;
	#defaultTileSize = 20;
}

class TileData {
	constructor() {
		this.texture = INVISIBLE;
	}
}

class TileSprite extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
	}
}

class FinalRender extends PIXI.Sprite {
	constructor(texture) {
		super(texture);
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