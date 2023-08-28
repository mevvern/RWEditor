function parseOriginalLevel(projectFileString) {
	let parsedLevel = parse(projectFileString);
    if (! parsedLevel[0].water) {
        console.log("water line did not exist!");
        parsedLevel[0].water = ogLevelFile.parsed.water;
    }
    if (! parsedLevel[0].props) {
        console.log("props line did not exist!");
        parsedLevel[0].props = ogLevelFile.parsed.props;
    }
    /* if (parsedLevel[1] && parsedLevel[1].length > 1) {   //the original level editor adds random junk onto the end of a bunch of project files
        console.log("leftovers =>" + parsedLevel[1]);       //this bit logs that junk to the console if it exists
    } */
	return parsedLevel[0]
	
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
		else throw new Error( "Wrong prefix. Expected", prefix, "at", tail );
	}

	/// Parsers ///

	//The trick is that each parser function returns a 2-element array.
	//Element 0 is the parsed item (the "head"), and element 1 is the rest of the string after that item
	//has been removed (the "tail"). Each function chips away at only the piece it understands.
	//This is the key to parser combinators.
	//Also when we call multiple parsers from the same function, we need to be careful to always thread
	//the `tail` returned from the *previous* function through, so that we always march forwards through
	//the string. (Usually I redeclare `tail` with the funny destructuring syntax.)

	function parse(tail) {
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
		if (next == '[') {
            return parseObject(tail)
        } else if (looksNumeric(next)) {
            return parseNumber(tail);
        } else if (next == '"') {
            return parseString(tail);
        } else if (tail.startsWith("point")) {
            return parsePoint(tail);
        } else if (tail.startsWith("rect")) {
            return parseRect(tail);
        } else if (tail.startsWith("color")) {
            return parseColor(tail);
        } else {
            return [null, ''];
        }
    }

	function parseObject(tail) {
		tail = stripPrefixRequired(tail, '[');

		let object = [];
		while (true) {
			tail = tail.trimStart(); //munch whitespace
			let next = tail.charAt(0);

			if (next == ']') {
				//end of the array
				tail = tail.slice(1); //consume the ]
				return [object, tail];
			} else if (next == '#') {
				//Named property. First, read the property name.
				if (Array.isArray(object)) {
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
		while (looksNumeric(tail.charAt(i))) i++;

		if (i == 0) throw { "doesn't look numeric": tail };

		let numberUnparsed = tail.slice(0, i);
		let numberParsed = parseFloat(numberUnparsed);
		tail = tail.slice(i);

		return [numberParsed, tail];
	}

	//Parses the key of a lingo object, delimited on the left with # and the right with :.
	function parseKey(tail) {
		tail = stripPrefixRequired(tail, '#');

		let colon = tail.indexOf(':');
		if (colon == -1) throw { "couldn't find matching colon": tail };

		let key = tail.slice(0, colon);
		tail = tail.slice(colon + 1); //consume the colon too

		return [key, tail]
	}

	//Parse the funny "point(1, 2)" syntax.
	function parsePoint(tail) {
		tail = stripPrefixRequired(tail, "point");

		let tuple;
		[tuple, tail] = parseTuple(tail);

		return [{ "x": tuple[0], "y": tuple[1], "type": "point"}, tail];
	}

	function parseRect(tail) {
		tail = stripPrefixRequired(tail, "rect");

		let tuple;
		[tuple, tail] = parseTuple(tail);

		//idk if this is x/y/w/h or x1/y1/x2/y2 format, you figure it out
		return [{ "a": tuple[0], "b": tuple[1], "c": tuple[2], "d": tuple[3], "type": "rect" }, tail];
	}

	function parseColor(tail) {
		tail = stripPrefixRequired(tail, "color");

		let tuple;
		[tuple, tail] = parseTuple(tail);

		return [{ "red": tuple[0], "green": tuple[1], "blue": tuple[2], "type": "color"}, tail];
	}

	//TODO: You could maybe feed this right back into parseObject; have it take
	//whether to use parens or brackets as a parameter
	function parseTuple(tail) {
		tail = stripPrefixRequired(tail, '(');

		let tuple = [];
		while (true) {
			tail = tail.trimStart();

			let next = tail.charAt(0);
			if (next == ')') return [tuple, tail.slice(1)];

			let num;
			[num, tail] = parseNumber(tail);

			tuple.push(num);

			//consume any whitespace and commas
			tail = tail.trimStart();
			tail = stripPrefixOptional(tail, ',');
		}
	}

	//Parse a double-quoted string.
	function parseString(tail) {
		tail = stripPrefixRequired(tail, '"');

		//TODO: handle escape characters. This is a naive indexOf search so
		//it will get tripped up on stuff like "aaa\"bbb" and it will think the
		//string is `aaa\`. I don't know how Director actually escapes quotes in strings.

		let quote = tail.indexOf('"');
		if (quote == -1) throw { "couldn't find matching double-quote": tail };

		let string = tail.slice(0, quote);
		tail = tail.slice(quote + 1); //consume the quote too

		return [string, tail];
	}
}

function importLevel() {
    const file = levelTxtSelect.files[0]
	if (file) {
        const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function (event) {
			if (typeof(event.target.result) === 'string' && event.target.result.slice(0, 4) === '[[[[' && event.target.result.includes(']]]]]')) {
                console.log(`loading level "${file.name}"...`);
                //parse the level's weird lingo stuff into a js object (thank you quat i love you)
                ogLevelFile.string = event.target.result;
				ogLevelFile.parsed = parseOriginalLevel(ogLevelFile.string);
				//get the name
                handleNameChange(file.name.slice(0, file.name.lastIndexOf('.txt')));
                //get the level size
				levelSave.tilesPerRow = ogLevelFile.parsed.levelProperties.size.x;
				levelSave.tilesPerColumn = ogLevelFile.parsed.levelProperties.size.y;
				//get the play area (aka buffer tiles)
				levelSave.playStartX = ogLevelFile.parsed.levelProperties.extraTiles[0];
				levelSave.playStartY = ogLevelFile.parsed.levelProperties.extraTiles[1];
				levelSave.playEndX = levelSave.tilesPerRow - ogLevelFile.parsed.levelProperties.extraTiles[2];
				levelSave.playEndY = levelSave.tilesPerColumn - ogLevelFile.parsed.levelProperties.extraTiles[3];
				//mapping the data from the original file to this editor's format
                prevAutoSlope = editorSave.autoSlope;
                editorSave.autoSlope = false;
                initLevelArray();
				ogLevelFile.parsed.geometry.forEach((column, x) => {
					column.forEach((tile, y) => {
						tile.forEach((layer, layerIndex) => {
							layer.forEach((value, componentIndex) => {
								//componentIndex of 0 is main value, 1 is stackables
								if (componentIndex === 0) {
                                    if (value != 7) {
                                        addValue(layerIndex, chooseComponent(tileMap.import(value, componentIndex)), x, y, tileMap.import(value, componentIndex));
                                    } 
								} else if (value[0]) {
                                    value.forEach((stackable) => {
										addValue(layerIndex, chooseComponent(tileMap.import(stackable, componentIndex)), x, y, tileMap.import(stackable, componentIndex));
									})
								}
							})
						})
					})
				})
                drawVisLevel();
                editorSave.autoSlope = prevAutoSlope;
			} else {
				alert('try a valid level file next time :3');
			}
		}
	}
}

levelTxtSelect.addEventListener('change', importLevel);
