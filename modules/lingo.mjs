import {vec2, vec3, vec4} from "./utils.mjs"

export class LingoStringify {
	static stringify = (LONString) => {

	}
}

export class LingoParse {
	static parse = (LONString, option) => {
		let parsedLingo;
		if (option === "project") {
			parsedLingo = parseProject(LONString);

		} else if (option === "init") {
			parsedLingo = parseInit(LONString);

		} else {
			throw new Error("invalid parse option supplied!")
		}

		if (option === "project" && ! parsedLingo[0].water) {
			console.log("water line did not exist!");
			//parsedLingo[0].water = ogLevelFile.parsed.water;
		}

		if (option === "project" && ! parsedLingo[0].props) {
			console.log("props line did not exist!");
			//parsedLingo[0].props = ogLevelFile.parsed.props;
		}

		/* if (parsedLingo[1] && parsedLingo[1].length > 1) {   //the original level editor adds random junk onto the end of a bunch of project files
			console.log("leftovers =>" + parsedLingo[1]);       //this bit logs that junk to the console if it exists
		} */

		return parsedLingo;
		
		/// Utilities ///
		function looksNumeric(char) {
			//need to nullcheck because (null >= '0' && null <= '9') == true, lmaoooo thanks js
			return char != null && ((char >= '0' && char <= '9') || char == '-' || char == '.')
		}
	
		function stripPrefixOptional(tail, prefix) {
			if (tail.startsWith(prefix)) return tail.slice(prefix.length);
			else return tail;
		}
	
		function stripPrefixRequired(tail, prefix) {
			if (tail.startsWith(prefix)) return tail.slice(prefix.length);
			else throw new Error( "Wrong prefix. Expected \"" + prefix + "\" at \"" + tail + "\"");
		}
	
		/// Parsers ///
	
		//The trick is that each parser function returns a 2-element array.
		//Element 0 is the parsed item (the "head"), and element 1 is the rest of the string after that item
		//has been removed (the "tail"). Each function chips away at only the piece it understands.
		//This is the key to parser combinators.
		//Also when we call multiple parsers from the same function, we need to be careful to always thread
		//the `tail` returned from the *previous* function through, so that we always march forwards through
		//the string. (Usually I redeclare `tail` with the funny destructuring syntax.)
	
		function parseInit(tail) {
			let obj = [];
			let counter = 0;

			while (tail) {

				[obj[counter], tail] = parseExpr(tail.trimStart());
			
				counter++
			}

			return obj;
		}
		

		function parseProject(tail) {
			let geometry;
			[geometry, tail] = parseExpr(tail.trimStart());
	
			let tiles;
			[tiles, tail] = parseExpr(tail.trimStart());
	
			let effects;
			[effects, tail] = parseExpr(tail.trimStart());
	
			let light;
			[light, tail] = parseExpr(tail.trimStart());
	
			let environment;
			[environment, tail] = parseExpr(tail.trimStart());
	
			let levelProperties;
			[levelProperties, tail] = parseExpr(tail.trimStart());
	
			let cameras;
			[cameras, tail] = parseExpr(tail.trimStart());
	
			let water;
			[water, tail] = parseExpr(tail.trimStart());
	
			let props;
			[props, tail] = parseExpr(tail.trimStart());
	
			return [{
				"geometry": geometry,
				"tiles": tiles,
				"effects": effects,
				"light": light,
				"environment": environment,
				"levelProperties": levelProperties,
				"cameras": cameras,
				"water": water,
				"props": props
			}, tail]
		}

		function parseExpr(tail) {
			tail = tail.trimStart();
	
			let next = tail.charAt(0);
			
			if (next === "[") {
				return parseObject(tail)

			} else if (!tail.startsWith("-[") && looksNumeric(next)) {
				return parseNumber(tail);

			} else if (next === '"') {
				return parseString(tail);

			} else if (tail.startsWith("point")) {
				return parsePoint(tail);

			} else if (tail.startsWith("rect")) {
				return parseRect(tail);

			} else if (tail.startsWith("color")) {
				return parseColor(tail);

			} else if (tail.startsWith("-[")) {
				return parseCategory(tail);

			} else {
				return [null, ""];
			}
		}
	
		function parseCategory(tail) {
			tail = stripPrefixRequired(tail, "-");
			let category;

			[category, tail] = parseObject(tail);

			return [category, tail];
		}

		function parseObject(tail) {
			tail = stripPrefixRequired(tail, "[");
	
			let object = [];

			while (true) {
				tail = tail.trimStart(); //munch whitespace

				let next = tail.charAt(0);
	
				if (next == "]") {
					//end of the array
					tail = tail.slice(1); //consume the ]
					return [object, tail];

				} else if (next == '#') {
					//Named property. First, read the property name.
					if (object instanceof Array) {
						object = {};
					}

					//(parseKey munches the # and : characters)
					let key;
					[key, tail] = parseKey(tail);
	
					//Then some whitespace maybe
					tail = tail.trimStart();
	
					//followed by the value.
					let value;
					[value, tail] = parseExpr(tail);
	
					object[key] = value;
					
				} else {
					//Unnamed property (array-like), add it with .push().
					let expr;
					[expr, tail] = parseExpr(tail);
	
					object.push(expr);
				}
	
				//Consume any whitespace and commas after the array element
				tail = tail.trimStart();
				tail = stripPrefixOptional(tail, ',');
			}
		}
	
		//Parses some floating-point number.
		function parseNumber(tail) {
			let i = 0;
			while (looksNumeric(tail.charAt(i))) {
				i++;
			}
	
			if (i === 0) {
				throw new Error("[parseNumber] | \"" + tail + "\" doesn't look numeric")
			}
			let numberUnparsed = tail.slice(0, i);
			let numberParsed = parseFloat(numberUnparsed);
			tail = tail.slice(i);
	
			if (numberUnparsed.includes(".")) {
				return [{"value": numberParsed, "type": "float"}, tail];
			} else {
				return [numberParsed, tail];
			}
		}
	
		//Parses the key of a lingo object, delimited on the left with # and the right with :.
		function parseKey(tail) {
			tail = stripPrefixRequired(tail, '#');
	
			let colon = tail.indexOf(":");

			if (colon === -1) {
				throw new Error("[parseKey] | couldn't find matching colon at \"" + tail + "\"");
			} 
	
			let key = tail.slice(0, colon);
			tail = tail.slice(colon + 1); //consume the colon too
	
			return [key, tail]
		}
	
		//Parse the funny "point(1, 2)" syntax.
		function parsePoint(tail) {
			tail = stripPrefixRequired(tail, "point");
	
			let tuple;
			[tuple, tail] = parseTuple(tail);
	
			return [new vec2(tuple[0], tuple[1]), tail];
		}
	
		function parseRect(tail) {
			tail = stripPrefixRequired(tail, "rect");
			let tuple;
			[tuple, tail] = parseTuple(tail);
	
			//idk if this is x/y/w/h or x1/y1/x2/y2 format, you figure it out
			return [new vec4(tuple[0], tuple[1], tuple[2], tuple[3]), tail];
		}
	
		function parseColor(tail) {
			tail = stripPrefixRequired(tail, "color");
	
			let tuple;
			[tuple, tail] = parseTuple(tail);
	
			const color = new vec3(tuple[0], tuple[1], tuple[1]);

			color.type = "color";

			return [color, tail];
		}
	
		//TODO: You could maybe feed this right back into parseObject; have it take
		//whether to use parens or brackets as a parameter
		function parseTuple(tail) {
			tail = stripPrefixRequired(tail, '(');
	
			let tuple = [];
			while (true) {
				tail = tail.trimStart();
	
				let next = tail.charAt(0);

				if (next === ")") {
					return [tuple, tail.slice(1)];
				}
	
				let num;
				[num, tail] = parseNumber(tail);
	
				tuple.push(num);
	
				//consume any whitespace and commas
				tail = tail.trimStart();
				tail = stripPrefixOptional(tail, ",");
			}
		}
	
		//Parse a double-quoted string.
		function parseString(tail) {
			tail = stripPrefixRequired(tail, '"');
	
			//TODO: handle escape characters. This is a naive indexOf search so
			//it will get tripped up on stuff like "aaa\"bbb" and it will think the
			//string is `aaa\`. I don't know how Director actually escapes quotes in strings.
	
			let quote = tail.indexOf('"');
			if (quote == -1) {
				throw new Error("[parseString] | couldn't find matching double quote at \"" + tail + "\"");
			}
	
			let string = tail.slice(0, quote);
			tail = tail.slice(quote + 1); //consume the quote too
	
			return [string, tail];
		}
	}
}