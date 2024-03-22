import {LingoParse, LingoStringify} from "./lingo.mjs";

export class vec2 {
	constructor(x, y) {
		if (typeof y === "number") {
			this.x = x;
			this.y = y;
		} else {
			this.x = 0;
			this.y = 0;
		}

		this.set = (x, y) => {
			if (!y) {
				this.x = x;
				this.y = x;
			} else {
				this.x = x;
				this.y = y;
			}
		}

		this.dupe = () => {
			return new vec2(this.x, this.y)
		}
	}
	get data() {
		return [x, y];
	}
}

export class vec3 {
	constructor (x, y, z) {
		if (typeof z === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
		} else {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		}

		this.dupe = () => {
			return new vec3(this.x, this.y, this.z)
		}
		
	}
	get data() {
		return [x, y, z]
	}
}

export class vec4 {
	constructor (x, y, z, w) {
		if (typeof w === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		} else {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 0;
		}

		this.dupe = () => {
			return new vec4(this.x, this.y, this.z, this.w)
		}
	}
	get data() {
		return [x, y, z, w];
	}
}

//Area takes in a variety of definitions of an area on the level, and converts that to a list of real tile positions to be iterated over. it can also be used to store a copy of the level data in the defined area
export class Area extends Array{
	constructor (tileList) {
		super();
		if (tileList instanceof Array) {
			for (const tile of tileList) {
				this.push(tile);
			}
			
			this.storesTiles = tileList.storesTiles;

		} else {
			throw new TypeError("tileList must be an array");
		}
	}

	static rect = (rectArea, layer, storeTiles) => {
		if (rectArea instanceof vec4) {
			const tileList = [];
			for (let i = rectArea.x; i < rectArea.z; i++) {
				for (let i = rectArea.y; j < rectArea.w; j++) {
					tileList.push(level.tileAt(new vec2(i, j)))
				}
			}
			return Area(tileList);
		} else {
			throw new TypeError("rectangle must be defined by a vec4!");
		}
	}

	static ellipse = (position, layer, radius, storeTiles) => {
		if (position instanceof vec2) {
			const tileList = [];
			for (let x = position.x - radius; x < position.x + radius; x++) {
				for (let y = position.y - radius; y < position.y + radius; y++) {
					if ((x - position.x ^ 2) + (y - position.y ^ 2) <= (radius ^ 2) && x >= 0 && x < level.size.x) {
						if (storeTiles) {
							tileList.push(level.tileAt(position, layer));
						} else {
							tileList.push(new vec2(x, y));
						}
					}
				}
			}
			return Area(tileList);
		} else {
			throw new TypeError("position must be a vec2~ :3");
		}
	}
}

export class Layer extends Array{
	constructor(size, Class) {
		super();
		for (let i = 0; i < size.x; i++) {
			this.push(new Column(size.y, Class));
		}

		/**
		 * iterate over every item in the layer. passes arguments to the callback: (item, position)
		 * @param {Function} callback
		 */
		this.iterate = (callback) => {
			for (const [x, column] of this.entries()) {
				for (const [y, item] of column.entries()) {
					callback(item, new vec2(x, y));
				}
			}
		}

		/**
		 * @param {vec2} pos
		 * @function returns the item at the supplied position
		 * @returns {PIXI.Sprite}
		 */
		this.at = (pos) => {
			return this[pos.x][pos.y];
		}
	}
}

class Column extends Array {
	constructor(height, Class) {
		super();
		for (let y = 0; y < height; y++) {
			this.push(new Class());
		}
	}
}

export function tileAllowed(tilePos, tileType) {
	const lookup = {
		"air": [true, true, true],
		"wall": [true, true, true], 
		"slope BL": [true, true, true], 
		"slope TL": [true, true, true], 
		"slope TR": [true, true, true], 
		"slope BR": [true, true, true], 
		"cool scug": [true, true, true], 
		"semisolid platform": [true, true, true], 
		"invisible wall": [true, true, true], 
		"pole H": [true, true, true], 
		"pole V": [true, true, true], 
		"cross pole": [true, true, true], 
		"shortcut path": [true, false, false], 
		"shortcut entrance": [true, false, false], 
		"creature den": [true, false, false], 
		"creature shortcut": [true, false, false], 
		"scavenger den": [true, false, false], 
		"garbage worm den": [true, false, false], 
		"batfly hive": [true, true, true], 
		"waterfall": [true, false, false], 
		"worm grass": [true, false, false], 
		"room transition": [true, false, false], 
		"spear": [true, false, false], 
		"rock": [true, false, false], 
		"forbid batfly chains": [true, false, false]
	}

	if (!(tileType in lookup)) {
		throw new Error("{tileAllowed}: " + "tile \"" + tileType + "\" does not exist");
	}

	return lookup[tileType][tilePos.z];
}

class Lingo {
	constructor() {
		/**
		 * @param {Object} JSObject - the javascript object to convert to a LON string. only supports objects without functions, and arrays
		 * @function parses a JavaScript object to a "Lingo object notation" string
		 * @returns {string}
		 */
		this.stringify = LingoStringify.stringify;

		/**
		 * @param {string} LONString - the LON string to convert to a javascript object
		 * @function parses a "Lingo object notation" string to a JavaScript object
		 * @returns {Object}
		 */
		this.parse = LingoParse.parse;
	}
}

export const LINGO = new Lingo();
