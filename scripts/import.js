function importLevel() {
    console.log('gaerhah');
    const file = levelTxtSelect.files[0]
	if (file && confirm('Do you really want to load a level?\nthis will delete the previous level if it\'s not saved')) {
        const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function (event) {
			if (typeof(event.target.result) === 'string' && event.target.result.slice(0, 4) === '[[[[' && event.target.result.includes(']]]]]')) {
                //parse the level's weird lingo stuff into a js object (thank you quat i love you)
                ogLevelFile.string = event.target.result
				ogLevelFile.parsed = parseLevel(ogLevelFile.string)
				//get the name
                handleNameChange(file.name.slice(0, file.name.lastIndexOf('.txt')));
                //get the level size
				levelSave.tilesPerRow = ogLevelFile.parsed.levelProperties.size.x;
				levelSave.tilesPerColumn = ogLevelFile.parsed.levelProperties.size.y;
				//get the play area (aka buffer tiles)
				levelSave.playStartX = ogLevelFile.parsed.levelProperties.extraTiles[0];
				levelSave.playStartY = ogLevelFile.parsed.levelProperties.extraTiles[1];
				levelSave.playEndX = levelSave.tilesPerRow - ogLevelFile.parsed.levelProperties.extraTiles[2]
				levelSave.playEndY = levelSave.tilesPerColumn - ogLevelFile.parsed.levelProperties.extraTiles[3]
				//mapping the data from the original file to this editor's format
                initLevelArray();
				ogLevelFile.parsed.geometry.forEach((column, x) => {
					column.forEach((tile, y) => {
						tile.forEach((layer, layerIndex) => {
							layer.forEach((value, componentIndex) => {
								//componentIndex of 0 is main value, 1 is stackables
                                layerIndex;
								if (componentIndex === 0) {
                                    addValue(layerIndex, x, y, tileMap.import(value, componentIndex), false);
								} else if (value[0]) {
                                    value.forEach((stackable) => {
										addValue(layerIndex, x, y, tileMap.import(stackable, componentIndex), false);
									})
								}
							})
						})
					})
				})
                drawVisLevel();
			} else {
				alert('try a valid level file next time :3');
			}
		}
	}
}

levelTxtSelect.addEventListener('change', importLevel);
