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

export function pluralize(number, word) {
	if (number !== 1) {
		return `${number} ${word}s`;
	} else {
		return `${number} ${word}`;
	}
}

export function prng(seed) {
  let random = seed;

	for (let i = 0; i < 10; i++) {
		random = (1664525 * random + 1013904223) % 4294967296;
	}

	random /= 4294967296;

  return random;
}

export async function getShader(id) {
	let src = null;

	await fetch("./resources/shaders/" + id + "/shader.frag").then((response) => {
		return response.text();
	}).then((text) => {
		src = text;
	});

	return src;
}

export async function getIterativeShader (id) {
	let init, iterate;
	await fetch("./resources/shaders/" + id + "/init.frag").then((response) => {
		init = response.text();

	}).catch(() => {
		throw new Error("iterative shaderset \"" + id + "\" does not exist");
	})

	await fetch("./resources/shaders/" + id + "/init.frag").then((response) => {
		iterate = response.text();

	}).catch(() => {
		throw new Error("iterative shaderset \"" + id + "\" does not exist");
	})
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

export function connectedTileLUT (adjacent) {
	/*adjacents are calucluated as such:
			5 1 6 
			4	■ 2
			8 3 7
		edges are checked first, then corners, such that the first half of the byte is dedicated to edges, and the second half is dedicated to corners

		for instance, the layout
			■ X ■ 
			X	■ ■
			X X ■
		would result in the byte: 0100 1110
				
	*/

	const LUT = [0, 0, 0, 0]



	return 1;

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

export function generateFrame(sourceRect) {
	if (sourceRect instanceof vec4) {
		const frame = {
			"frame": {"x" : sourceRect.x, "y" : sourceRect.y, "w" : sourceRect.z, "h" : sourceRect.w},
			"rotated": false,
			"trimmed": false,
			"spriteSourceSize": {"x" : 0, "y" : 0, "w" : sourceRect.z, "h" : sourceRect.w},
			"sourceSize": {"w" : sourceRect.z, "h" : sourceRect.w},
			"anchor": {"x":0,"y":0}
		};
		
		return frame;
	} else {
		throw new TypeError("source rect must be vec4!")
	}
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
