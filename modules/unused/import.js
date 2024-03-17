function parseOriginalLevel(projectFileString) {
	
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
									let component = chooseComponent(tileMap.import(value, componentIndex));
									if ((component === 2 || component === 3) && layer != 0) {
										return
									} else if (value != 7) {
										levelSave.levelArray[layerIndex][component][x].splice(y, 1, tileMap.import(value, componentIndex));
									} 
								} else if (value[0]) {
									value.forEach((stackable) => {
										let currentTile = levelSave.levelArray[layerIndex][chooseComponent(tileMap.import(value, componentIndex))][x][y];
										let tileToPlace = tileMap.import(stackable, componentIndex);
										let component = chooseComponent(tileMap.import(value, componentIndex));
										if ((component === 2 || component === 3) && layer != 0) {
											return
										} else if (currentTile === 7 && tileToPlace === 8 || currentTile === 8 && tileToPlace === 7) {
											levelSave.levelArray[layerIndex][0][x].splice(y, 1, 9)
										} else {
											levelSave.levelArray[layerIndex][chooseComponent(tileMap.import(stackable, componentIndex))][x].splice(y, 1, tileMap.import(stackable, componentIndex));
										}
										//addValue(layerIndex, chooseComponent(tileMap.import(stackable, componentIndex)), x, y, tileMap.import(stackable, componentIndex));
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
