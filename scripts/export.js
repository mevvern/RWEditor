function transferLevel() {
	//apply all of my editor's parameters to the project file object
    //a template project is parsed on startup so there's always something to work off of here
    
    let geometry = ogLevelFile.parsed.geometry;
    let tlMatrix = ogLevelFile.parsed.tiles.tlMatrix;
    let effects = ogLevelFile.parsed.effects.effects;

    //initializing projectfile geometry so its the same size as the level in the editor, and also empty so theres no stray tiles
    geometry = new Array();
        for (let i = 0; i < levelSave.tilesPerRow; i++) {
            geometry.push(new Array());
            for (let j = 0; j < levelSave.tilesPerColumn; j++) {
                geometry[i].push(new Array());
                for (let k = 0; k < 3; k++) {
                    geometry[i][j].push([0, []]);
                }
            }
        }

    //writing geometry
    levelSave.levelArray.forEach((layer, layerIndex) => {
        layer.forEach((component) => {
            component.forEach((column, x) => {
                column.forEach((tileValue, y) => {
                    if (tileValue != 0) {
                        tile = tileMap.export(tileValue);
                        if (tile[1] === 0) {
                            if (layerIndex != 0 && tileValue === 13) {
                                geometry[x][y][layerIndex].splice(0, 1, 1);
                            } else {
                                geometry[x][y][layerIndex].splice(0, 1, tile[0]);
                            }
                        } else {
                            if (tile[0] === "cross pole") {
                                geometry[x][y][layerIndex][1].push(1, 2);
                            } else {
                                geometry[x][y][layerIndex][1].push(tile[0]);
                            }
                        }
                    }
                });
            });
        });
    });

    //initializing projectfile tiles and effects
    //since i dont have tile or effect editors im just resizing their respective arrays to preserve the original tiles/effects, if any
    let tlSize = new Point(tlMatrix.length, tlMatrix[0].length);
    let tlDiff = new Point(levelSave.tilesPerRow - tlSize.x, levelSave.tilesPerColumn - tlSize.y);
    
    //if new width is smaller, remove tiles from the right
    if (tlDiff.x < 0) {
        for (let i = 0; i < Math.abs(tlDiff.x); i++) {
            tlMatrix.pop();
            effects.forEach((effect) => {
                effect.mtrx.pop();
            })
        }
    //if new width is larger, add tiles to the right    
    } else if (tlDiff.x > 0) {
        for (let i = 0; i < Math.abs(tlDiff.x); i++) {
            tlMatrix.push(new Array(tlSize.y).fill(54))
            effects.forEach((effect) => {
                effect.mtrx.push(new Array(tlSize.y).fill(0));
            })
            tlMatrix[i + tlSize.x].forEach((tile, index) => {
                tlMatrix[i + tlSize.x][index] = [];
                for (let j = 0; j < 3; j++) {
                    tlMatrix[i + tlSize.x][index].push({"tp": "default", "Data": 0});
                }
            })
        }
    }
    //if new height is smaller, remove tiles from the bottom
    if (tlDiff.y < 0) {
        tlMatrix.forEach((column) => {
            for (let i = 0; i < Math.abs(tlDiff.y); i++) {
                effects.forEach((effect) => {
                    effect.mtrx.forEach((column) => {
                        column.pop();
                    });
                })
                column.pop();
            }
        })
    //if new height is larger, add tiles to the bottom
    } else if (tlDiff.y > 0) {
        tlMatrix.forEach((column) => {
            for (let i = 0; i < Math.abs(tlDiff.y); i++) {
                effects.forEach((effect) => {
                    effect.mtrx.forEach((column) => {
                        column.push(0);
                    })
                })
                column.push([]);
                for (let j = 0; j < 3; j++) {
                    column[i + tlSize.y].push({"tp": "default", "Data": 0});
                }
            }
        })
    }
    
    ogLevelFile.parsed.geometry = geometry;
    ogLevelFile.parsed.tiles.tlMatrix = tlMatrix;
    ogLevelFile.parsed.effects.effects = effects;

    //changing play area border (extraTiles or buffer tiles)
    let extraTiles = new Array(4);
    extraTiles[0] = levelSave.playStartX;
    extraTiles[1] = levelSave.playStartY;
    extraTiles[2] = tilesPerRow - levelSave.playEndX;
    extraTiles[3] = tilesPerColumn - levelSave.playEndY;
    ogLevelFile.parsed.levelProperties.extraTiles = extraTiles;

    //changing level size
    let levelSize = ogLevelFile.parsed.levelProperties.size;
    levelSize.x = tilesPerRow;
    levelSize.y = tilesPerColumn;
    ogLevelFile.parsed.levelProperties.size = levelSize;
}

function exportLevel() {
    
    //generate the text file
    const file = new File(parseMyLevel(), `${levelSave.levelName}.txt`, {type: 'text/plain'});
    //download text file
    console.log("downloading" + ' "' + file.name + '"');
    /* const link = document.createElement('a')
    const url = URL.createObjectURL(file)
  
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
  
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url) */
}

levelExportButton.addEventListener('click', () => {
    console.log("exporting level!!!!")
})
