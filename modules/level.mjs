import {vec2, vec3, vec4, tileAllowed, Layer, Area, prng} from "./utils.mjs";
import {renderContext, editor} from "./main.mjs";
import {tileMap} from "./tileMap.mjs";

export class Level {
	constructor (size) {
		if (!size instanceof vec2) {
			size = new vec2(144, 86);
		}
			
			//properties=============================================================================
			this.#size = size;
			this.#bounds = new vec4(0, 0, size.x - 1, size.y - 1);
			this.seed = prng(1);
			this.tiles = [];
			this.effect = [];
			this.prop = [];
			this.history = [];
			this.palette = null;

			//initialization

			for (let layer = 0; layer < 3; layer++) {
				this.tiles.push(new Layer(this.size, Tile));
			}

			//effect methods----------------------------
			this.addEffect = (id) => {
				this.effect.forEach(effect => {
					if (effect.id === id) {
						throw new Error("effect id must be unique")
					}
					
				})
				this.effect.push(new Effect(this.#size, id));
			}

			this.editEffect = (id, area) => {
				
			}

			this.listEffects = () => {
				const effList = [];
				this.effect.forEach(effect => {
					effList.push(effect.id);
				})
				return effList;
			}

			//geometry methods---------------------------
			this.setGeo = (posList, newGeo) => {
				if (!(posList instanceof Array)) {
					posList = [posList];
				}

				const editList = [];

				for (const pos of posList) {
					if (this.withinBounds() && tileAllowed(pos, newGeo)) {
						const tile = this.tileAt(pos);

						if (tile) {
							tile.geometry = newGeo;
							if (newGeo.includes("pole")) {
								for (let layer = pos.z * 10 + 4; layer < (pos.z + 1) * 10 - 4; layer++) {
									const newPos = new vec3(pos.x, pos.y, layer)
									const editTile = {};
								
									editTile.texture = newGeo;
									editTile.pos = newPos;

									editList.push(editTile);
								}
							} else if (newGeo === "cool scug") {
								const newPos = new vec3(pos.x, pos.y, pos.z * 10);
								const editTile = {};
								
								editTile.texture = newGeo;
								editTile.pos = newPos;

								editList.push(editTile);
								
							} else {
								for (let layer = pos.z * 10; layer < (pos.z + 1) * 10; layer++) {
									const newPos = new vec3(pos.x, pos.y, layer)
									const editTile = {};
								
									editTile.texture = newGeo;
									editTile.pos = newPos;

									editList.push(editTile);
								}
							}
						}
					}
				}

				renderContext.setTile(editList);
			}

			//texture methods-----------------------------
			this.setTex = (tiles, newTile, position) => {
				if (tiles instanceof Area) {
					Area.forEach(tile => {
						console.log(this.tiles[tile.position.z][tile.position.x][tile.position.y].texture);
					})
				} else {
					if (position instanceof vec3) {
						console.log(this.tiles[z][x][y].texture);
					} else {
						throw new TypeError("position must be an instance of vec3! {x: x, y: y, z: layer}")
					}
					
				}
			}
			
			//prop methods=------------------------------------------


			//light methods------------------------------------------


			//misc methods-------------------------------
			
			this.tileAt = (pos) => {
				if (pos instanceof vec3) {
					let tile = this.tiles[pos.z][pos.x][pos.y];
					if (!tile) {
						return null;
					}
					tile.pos = pos;
					return tile;
				}
			}

			this.withinBounds = () => {
				if (editor.mouse.insideBounds.x && editor.mouse.insideBounds.y) {
					return true;
				} else {
					return false;
				}
			}

			this.iterateOverTiles = (callback) => {
				for (const [z, layer] in this.tiles.entries()) {
					for (const [x, column] in layer.entries()) {
						for (const [y, tile] in column.entries()) {
							callback(tile, new vec3(x, y, z));
						}
					}
				}
			}

			this.iterateOverProps = (callback) => {
				for (const prop in this.prop) {
					callback(prop);
				}
			}
	}

	//private methods
	#changeSize = (newBounds) => {
		if (newBounds instanceof vec4) {
			//the new position of the top left corner relative to the current top left corner
			const topLeft = new vec2();

			//the new position of the bottom right corner relative to the current bottom right corner
			const bottomRight = new vec2();

			//calculate the offsets for the new corners of the level
			topLeft.x = -newBounds.x
			topLeft.y = -newBounds.y

			
			bottomRight.x = newBounds.z - this.bounds.z;
			bottomRight.y = newBounds.w - this.bounds.w;

			//BEGINNINGS

			//add to the beginning of axis x
			if (topLeft.x > 0) {
				this.tiles.forEach(layer => {
					for (let x = 0; x < topLeft.x; x++) {
						layer.unshift(new Column(level.size.y))
					}
				})
			//subtract from the beginning of axis x
			} else if (topLeft.x < 0) {
				this.tiles.forEach(layer => {
					for (let x = 0; x < topLeft.x; x--) {
						layer.shift();
					}
				})
			}

			//add to the beginning of axis y
			if (topLeft.y > 0) {
				this.tiles.forEach(layer => {
					layer.forEach(column => {
						for (let y = 0; y < topLeft.y; y++) {
							column.unshift(new Tile());
						}
					})
				})
			//subtract from the beginning of axis y
			} else if (topLeft.y < 0) {
				this.tiles.forEach(layer => {
					layer.forEach(column => {
						for (let y = 0; y > topLeft.y; y++) {
							column.shift();
						}
					})
				})
			}

			//ENDS

			//add to the end of axis x
			if (bottomRight.x > 0) {
				this.tiles.forEach(layer => {
					for (let x = 0; x < bottomRight.x; x++) {
						layer.push(new Column(level.size.y))
					}
				})
			//subtract from the end of axis x
			} else if (bottomRight.x < 0) {
				this.tiles.forEach(layer => {
					for (let x = 0; x < bottomRight.x; x--) {
						layer.pop();
					}
				})
			}

			//add to the end of axis y
			if (bottomRight.y > 0) {
				this.tiles.forEach(layer => {
					layer.forEach(column => {
						for (let y = 0; y < bottomRight.y; y++) {
							column.push(new Tile());
						}
					})
				})
			//subtract from the end of axis y
			} else if (bottomRight.y < 0) {
				this.tiles.forEach(layer => {
					layer.forEach(column => {
						for (let y = 0; y > bottomRight.y; y++) {
							column.pop();
						}
					})
				})
			}
			
		} else {
			throw new TypeError("new bounds must be a vec4");
		}

		//re-init render context with new size and level data
		reInitRender();
	} 

	//private properties 
	#name = "Untitled Level";
	#size = new vec2();
	#bounds = new vec4();

	//setters and getters
	//name
	get name() {
		return this.#name
	}

	set name(name) {
		this.#name = name;
	}

	//bounds
	set bounds(newBounds) {
		this.#changeSize(newBounds);
		this.#size.x = bounds.z + 1;
		this.#size.y = bounds.w + 1;
	}

	get bounds() {
		return this.#bounds;
	}

	//size
	set size(newSize) {
		this.#size = newSize;
		this.#bounds.z = newSize.x - 1;
		this.#bounds.w = newSize.y - 1;
		this.#changeSize(this.bounds);
	}

	get size() {
		return this.#size
	}
}

class Tile {
	constructor() {
		this.geometry = "air";
		this.texture = "air";
		this.stackables = [];
		this.rootDepth = null
	}
}

class Effect extends Layer {
	constructor(size, id) {
		super(size, 0);
		this.id = id;
	}
}

class Prop {
	constructor(type, pos) {
		if (pos instanceof vec2) {
			this.pos = pos;
		} else {
			this.pos = new vec2(0, 0);
		}
		this.type = type;
		this.rootDepth = 0;
		this.scale = new vec3(1, 1, 1);
		this.rotation = new vec3(0, 0, 0);
	}
}

class Entity {
	constructor(type, pos) {
		if (typeof type === "string") {
			if (pos instanceof vec2) {
				this.pos = pos;
			} else {
				this.pos = new vec2(0, 0);
			}
			this.type = type;
		}
	}
}
