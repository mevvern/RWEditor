import * as PIXI from "./lib/pixi.mjs";
import * as projection from "./lib/pixi-projection.mjs"
import {Layer, vec2, vec4} from "./utils.mjs";
import {getShader} from "./utils.mjs";
import { level, renderContext } from "./main.mjs";

export class RenderLayerWith1Sprite extends projection.Container3d {
	/**
	 * 
	 * @param {vec2} levelSize 
	*/
	constructor(levelSize, shadowOffset) {
		//calls the constructor of the parent class, PIXI.Container in this case
		super();

		this.#levelPixelSize = new vec2(levelSize.x * this.#defaultTileSize, levelSize.y * this.#defaultTileSize);

		this.#shadowOffset = shadowOffset;
		//Layer object which contains 1 pixi sprite per x,y. has methods for accessing and iterating over each sprite
		this.tiles = new Layer(levelSize, TileData)

		//the container which has all of the sprites generated in the previous Layer instance
		this.tileSprite = new TileSprite();

		//the container which will contain prop sprites that aren't tile-based. it is set on top of everything else in the layer
		this.propContainer = new PropContainer();

		//the container which will store the preview sprite for the layer.
		this.previewContainer = new PreviewContainer();

		//the RenderTexture object which renderContainer will be rendered to
		this.baseRenderTextures = [PIXI.RenderTexture.create({width : levelSize.x * this.#defaultTileSize, height : levelSize.y * this.#defaultTileSize, scaleMode : PIXI.SCALE_MODES.NEAREST}), PIXI.RenderTexture.create({width : levelSize.x * this.#defaultTileSize, height : levelSize.y * this.#defaultTileSize, scaleMode : PIXI.SCALE_MODES.NEAREST})]

		this.shadowMaps = [PIXI.RenderTexture.create({width : levelSize.x * this.#defaultTileSize, height : levelSize.y * this.#defaultTileSize, scaleMode : PIXI.SCALE_MODES.NEAREST}), PIXI.RenderTexture.create({width : levelSize.x * this.#defaultTileSize, height : levelSize.y * this.#defaultTileSize, scaleMode : PIXI.SCALE_MODES.NEAREST})]

		//the sprite which will use the rendered texture as its texture. it is to be placed underneath the tile sprites
		this.finalRender = new FinalRender(this.renderTexture1);

		//the container which will contain the rendered layer, as well as the tiles over top of that. the whole container will be rendered to a texture when tile(s) needs to be updated
		this.renderContainer = new RenderContainer();

		//to the renderContainer, this adds the finalRender sprite, and then the tile sprite on top of that
		this.renderContainer.addChild(this.finalRender, this.tileSprite);

		//to this, which is the RenderLayer container, adds renderContainer, and then props container,and then preview container
		this.addChild(this.renderContainer, this.propContainer, this.previewContainer);

		this.finalRender.width = levelSize.x * this.#defaultTileSize;
		this.finalRender.height = levelSize.y * this.#defaultTileSize;

		
		this.tileSprite.texture = DEFAULT_TEXTURE;
		this.tileSprite.width = this.#defaultTileSize;
		this.tileSprite.height = this.#defaultTileSize;
		this.tileSprite.visible = false;

		this.#mask.width = levelSize.x * this.#defaultTileSize;
		this.#mask.height = levelSize.y * this.#defaultTileSize;

		this.renderContainer.addChild(this.#mask);

		this.#initShadowShaders();

		this.#updateMask(this.#clearRect);
		this.#mask.visible = false;

		/***********************************************
		 * updates the texture of the tile at the desired location or set of locations
		 * @param {PIXI.Texture} texture 
		 */
		this.updateTile = (tileList) => {
			const tileSprite = this.tileSprite;
			const baseRenderTextures = this.baseRenderTextures;

			this.finalRender.texture = baseRenderTextures[this.#renderedIndex];
			tileSprite.visible = true;

			for (const tile of tileList) {
				const storedTile = this.tiles.at(tile.pos);
				if (storedTile.texture.id !== tile.texture.id) {
					storedTile.texture = tile.texture;

					tile.pos.x *= this.#defaultTileSize;
					tile.pos.y *= this.#defaultTileSize;
					
					this.#clearRect.x = tile.pos.x;
					this.#clearRect.y = tile.pos.y;
					this.#updateMask(this.#clearRect);

					this.#mask.visible = true;
					this.finalRender.mask = this.#mask;

					tileSprite.position.set(tile.pos);
					tileSprite.texture = tile.texture;

					app.renderer.render(this.renderContainer, {renderTexture : baseRenderTextures[this.#bufferIndex]});

					this.finalRender.mask = null;
					this.#mask.visible = false;

					this.finalRender.texture = baseRenderTextures[this.#bufferIndex];

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
		}

		/**
		 * clears the layer's render textures
		 */

		this.clearbaseRenderTextures = () => {
			this.tileSprite.visible = false;

			this.finalRender.visible = false;

			app.renderer.render(this.renderContainer, {renderTexture : this.baseRenderTextures[1], clear : true});
			app.renderer.render(this.renderContainer, {renderTexture : this.baseRenderTextures[0], clear : true});

			this.finalRender.visible = true;
		}

		this.clearShadowRenderTextures = () => {
			this.#generateShadowSprite.visible = false;
			
			app.renderer.render(this.#generateShadowSprite, {renderTexture : this.shadowMaps[1], clear : true});
			app.renderer.render(this.#generateShadowSprite, {renderTexture : this.shadowMaps[0], clear : true});

			this.#generateShadowSprite.visible = true;
		}

		/**
		 * clears and then renders the whole layer
		 */

		this.renderAll = () => {
			const tileSprite = this.tileSprite;
			const baseRenderTextures = this.baseRenderTextures;

			tileSprite.visible = true;

			this.clearbaseRenderTextures();

			this.tiles.iterate((tile, pos) => {
				tileSprite.visible = true;
				if (tile.texture.id !== "INVISIBLE") {
					pos.x *= this.#defaultTileSize;
					pos.y *= this.#defaultTileSize;

					tileSprite.texture = tile.texture;

					tileSprite.position.set(pos);

					app.renderer.render(this.renderContainer, {renderTexture : baseRenderTextures[this.#bufferIndex]});

					this.finalRender.texture = this.baseRenderTextures[this.#bufferIndex];

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

		this.updateQuadSize = () => {
			const bounds = this.finalRender.getBounds();
			this.#renderShadowFilter.uniforms.uQuadSize = [bounds.width, bounds.height];
			this.#renderShadowFilter.uniforms.uQuadOrigin = [bounds.x, bounds.y];
		}

		this.updateResolution = () => {
			const resolution = [window.innerWidth, window.innerHeight];

			this.#generateShadowFilter.uniforms.uResolution = resolution;
			this.#renderShadowFilter.uniforms.uResolution = resolution;
		}

		this.getShadowMap = () => {
			const renderTarget = this.shadowMaps[1];

			this.#generateShadowSprite.texture = this.baseRenderTextures[this.#renderedIndex];

			app.renderer.render(this.#generateShadowSprite, {renderTexture : renderTarget});

			return renderTarget;
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
	#defaultTileSize = DEFAULT_TILE_SIZE;

	#generateShadowFilter = new PIXI.Filter();
	#renderShadowFilter = new PIXI.Filter();

	#generateShadowSprite = new PIXI.Sprite();
	#shadowOffset = new vec2(0.46, 0.004);

	#mask = new PIXI.Graphics();
	#levelPixelSize = new vec2();
	#clearRect = new vec4(100, 200, 20, 20);

	#updateMask = (rect) => {
		const mask = this.#mask;

		mask.clear();

		mask.beginFill([1, 0, 0, 1]);

		mask.drawRect(0, 0, this.#levelPixelSize.x, rect.y);
		mask.drawRect(0, rect.y, rect.x, rect.w);
		mask.drawRect(rect.x + rect.z, rect.y, this.#levelPixelSize.x - (rect.x + rect.z), rect.w);
		mask.drawRect(0, rect.y + rect.w, this.#levelPixelSize.x, this.#levelPixelSize.y - (rect.y + rect.w));
	}

	#initShadowShaders = async () => {
		const renderShadowSrc = await getShader("renderShadow");
		const generateShadowSrc = await getShader("generateShadowMap");
		const uniforms = {
			uShadowMap : this.shadowMap,
			uShadowAngle : this.#shadowOffset.x,
			uShadowMag : this.#shadowOffset.y,
			uResolution : [app.view.width, app.view.height],
			uQuadSize : [0, 0],
			uQuadOrigin : [0, 0],
			debug : false
		}

		this.#renderShadowFilter = new PIXI.Filter(null, renderShadowSrc, uniforms);
		this.#generateShadowFilter = new PIXI.Filter(null, generateShadowSrc, uniforms);

		this.updateQuadSize();

		this.#generateShadowSprite.filters = [this.#generateShadowFilter];

		this.filters = [this.#renderShadowFilter];
	}

	set shadowUniforms(uniforms) {
		this.#renderShadowFilter.uniforms.uShadowAngle = uniforms[0];
		this.#renderShadowFilter.uniforms.uShadowMag = uniforms[1];
		this.#generateShadowFilter.uniforms.uShadowAngle = uniforms[0];
		this.#generateShadowFilter.uniforms.uShadowMag = uniforms[1];
	}

	set shadowMap(map) {
		this.shadowMaps[0] = map;
		this.#renderShadowFilter.uniforms.uShadowMap = map;
		this.#generateShadowFilter.uniforms.uShadowMap = map;
	}

	get shadowMap() {
		return this.shadowMaps[0]
	}
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