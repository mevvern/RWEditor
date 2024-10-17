import {vec2, vec3, vec4, tileAllowed, Layer, Area, prng} from "./utils.mjs";
import {renderContext, editor, level} from "./main.mjs";
import {tileMap} from "./tileMap.mjs";

export class Level {
	constructor (size) {
		if (!size instanceof vec2) {
			size = new vec2(144, 86);
		}
			
			//properties=============================================================================
			this.#size = size;
			this.#bounds = new vec4(0, 0, size.x - 1, size.y - 1);
			this.seed = prng(Math.random());
			this.tiles = [];
			this.effect = [];
			this.prop = [];
			this.history = [];
			this.palette = null;

			console.log("level seed: " + this.seed);

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
			this.setTile = (tileList) => {
				if (!(tileList instanceof Array)) {
					tileList = [tileList];
				}

				const renderList = [];
				for (const tileToAdd of tileList) {
					const pos = tileToAdd.pos;
					if (level.withinBounds(pos) && renderContext.layerVis[pos.z]) {
						this.tiles[pos.z][pos.x][pos.y];

						this.tiles[pos.z][pos.x][pos.y].material = tileToAdd.material.id;
						this.tiles[pos.z][pos.x][pos.y].tileType = tileToAdd.tileType;
					}
					renderList.push(tileToAdd);
				}

				for (const tile of renderList) {
					const pos = tile.pos;
					switch(tile.material.type) {
						case "tile":
							tile.variant = 0;
							tile.option = 0;
						break
						case "simpleConnected":
							tile.variant = 0;
							tile.option = this.#findOption(tile, 0);
							this.updateSurroundings(pos, 0);
						break
						case "complexConnected":
							tile.variant = 0;
							tile.option = 0;
						break
					}
					renderContext.setTile(renderList);
				}

			}

			this.updateSurroundings = (pos, whatToUpdate) => {
				const posList = [];
				if (whatToUpdate === 0) { 	//simple mode
					posList.push(
						new vec3(pos.x, pos.y - 1, pos.z),
						new vec3(pos.x + 1, pos.y, pos.z),
						new vec3(pos.x, pos.y + 1, pos.z),
						new vec3(pos.x - 1, pos.y, pos.z)
					)

				} else if (whatToUpdate === 1) { //complex mode
					posList.push(
						new vec3(pos.x, pos.y - 1, pos.z),
						new vec3(pos.x + 1, pos.y - 1, pos.z),
						new vec3(pos.x + 1, pos.y, pos.z),
						new vec3(pos.x + 1, pos.y + 1, pos.z),
						new vec3(pos.x, pos.y + 1, pos.z),
						new vec3(pos.x - 1, pos.y + 1, pos.z),
						new vec3(pos.x - 1, pos.y, pos.z),
						new vec3(pos.x - 1, pos.y - 1, pos.z),
					)
				}

				const tileList = [];
				for (const pos of posList) {
					const tile = this.tileAt(pos);
					tile.pos = pos;
					switch(tile.material.type) {
						case "tile":
							tile.variant = 0;
							tile.option = 0;
						break
						case "simpleConnected":
							tile.variant = 0;
							tile.option = this.#findOption(tile, 0);
						break
						case "complexConnected":
							tile.variant = 0;
							tile.option = 0;
						break
					}
					tileList.push(tile);
				}

				renderContext.setTile(tileList);
			}

			//texture methods-----------------------------
			
			//prop methods=------------------------------------------


			//light methods------------------------------------------


			//misc methods-------------------------------
			
			this.tileAt = (pos) => {
				if (pos instanceof vec3) {
					let tile = this.tiles[pos.z][pos.x][pos.y];
					if (!tile) {
						return new Tile;
					}
					tile.pos = pos;
					return tile;
				}
			}

			this.withinBounds = (pos) => {
				if (pos instanceof vec3) {
					if (pos.x >= 0 && pos.x < this.size.x) {
						if (pos.y >= 0 && pos.y < this.size.y) {
							if (pos.z >= 0 && pos.z < 30) {
								return true
							}
						}
					}
					return false;

				} else {
					if (editor.mouse.insideBounds.x && editor.mouse.insideBounds.y) {
						return true;
					} else {
						return false;
					}
				}
				
			}

			this.withinBounds = (pos) => {
				if (pos instanceof vec3) {
					if (pos.x >= 0 && pos.x < this.size.x) {
						if (pos.y >= 0 && pos.y < this.size.y) {
							if (pos.z >= 0 && pos.z < 30) {
								return true
							}
						}
					}
					return false;

				} else {
					if (editor.mouse.insideBounds.x && editor.mouse.insideBounds.y) {
						return true;
					} else {
						return false;
					}
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
	#tileTypesThatConnect = ["wall", "slope BL", "slope TL", "slope TR", "slope BR", "semisolid platform"];

	#findOption = (tile, whatToCheck) => {
		const pos = tile.pos;
		let optionIndex = 0;
		let tileToCheck;

		switch(tile.tileType) {
			case "wall":
				if (whatToCheck === 0) { 	//simple mode
					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
		
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;
		
					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
		
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 8;
					
				} else if (whatToCheck === 1) { //complex mode
					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
		
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;
		
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
		
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 8;
		
					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 16;
		
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 32;
		
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 64;
		
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 128;
				}
			break
			case "slope BL":
				if (whatToCheck === 0) {
					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

				} else if (whatToCheck === 1) {
					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
				}
			break
			case "slope TL":
				if (whatToCheck === 0) {
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

				} else if (whatToCheck === 1) {
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1 ];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
				}
			break
			case "slope TR":
				if (whatToCheck === 0) {
					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

				} else if (whatToCheck === 1) {
					tileToCheck = this.tiles[pos.z][pos.x][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y - 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
				}
			break
			case "slope BR":
				if (whatToCheck === 0) {
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

				} else if (whatToCheck === 1) {
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 1;
	
					tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 2;

					tileToCheck = this.tiles[pos.z][pos.x][pos.y + 1];
					optionIndex += this.#compareTiles(tileToCheck, tile) * 4;
				}
			break
			case "semisolid platform":
				tileToCheck = this.tiles[pos.z][pos.x - 1][pos.y];
				optionIndex += this.#compareTiles(tileToCheck, tile) * 1;

				tileToCheck = this.tiles[pos.z][pos.x + 1][pos.y];
				optionIndex += this.#compareTiles(tileToCheck, tile) * 2;
			break
		}
		return optionIndex;
	}

	#compareTiles(checkTile, mainTile) {
		
		if (mainTile.material.id === checkTile.material.id && this.#tileTypesThatConnect.includes(checkTile.tileType)) {
			return 1;
		} else {
			return 0;
		}
	}

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

export class Tile {
	constructor() {
		this.tileType = "air";
		this.stackables = [];
		this.rootDepth = null;
	}

	#materialId = "debug";

	set material(materialId) {
		this.#materialId = materialId;
	}

	get material() {
		return renderContext.materials[this.#materialId];
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
