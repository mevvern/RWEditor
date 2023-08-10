//say hi to my horrible code!!!
const tileCount = 20;						//number of unique tiles for the atlas to store
const layerCount = 3;						//stores the number of layers to use

//vars which are saved with the level
let tilesPerRow = 72;						//size of the level
let tilesPerColumn = 43;
let playStartX = 12;						//play area starting coordinates
let playStartY = 3;
let playEndX = 60							//play area ending coordinates
let playEndY = 38
let screensWide = 1;
let screensTall = 1;
let levelName = 'New Level'

//"visual" settings
let customScreenWidth = 70;					//size of the main canvas in tiles (multiplied by baseTileSize to get the final )
let customScreenHeight = 35;
let zoomLevel = -4;							//stores the zoom level of the editor
let baseTileSize = 20;						//base size of each tile in pixels
let tileSize = zoomLevel + baseTileSize;	//the final tile size in pixels with zoom taken into account
let panX = 25;								//stores the x position in pixels that the user has moved the display to
let panY = 52;								//same, but for the y axis
let backgroundColor = 'white';
let gridColor = 'rgb(200, 200, 200)';
let playColor =	'rgb(255, 127, 127)';
let selColor = 'gold';
let levelBorderColor = 'rgb(127, 127, 255';
let layer1Color = 'rgba(0, 0, 0, 1)';
let layer2Color = 'rgba(200, 255, 200, 0.7)';
let layer3Color = 'pink';
let previewColor = 'rgba(150, 150, 150, 0.5)';
let deleteColor = 'rgba(255, 200, 200, 0.5)';
let boxFillColor = 'red';
let boxDeleteColor = 'red';
let showGrid = true;						//whether or not to show the grid
let previewChoice = true;					//whether or not to show the preview at the current mouse tile

//tool and tile settings 
let tileChoice = 1;
let toolChoice = 0;
let layerChoice = 0;						//stores the current work layer
let slopeChoice = 2;
let doingMouseThing = false;

//selection
let selBox = false;							//whether or not to show the selection box
let drawSel = false;
let airReplace = true;
let startTileX = 0;
let startTileY = 0;
let selStartX = 0;							//selection starting coords
let selStartY = 0;
let selEndX = 0;							//selection ending coords
let selEndY = 0;
let mouseOffsetX = 0;
let mouseOffsetY = 0;

//DOM elements
const screen = document.getElementById('editorCanvas');							//the canvas element which forms the main display
const tileButtons = document.querySelectorAll('.tileButton');					//the tile choice buttons
const toolButtons = document.querySelectorAll('.toolButton');					//tool choice buttons
const tileIndicator = document.getElementById('tileSelection');					//the tile choice indicator element
const toolIndicator = document.getElementById('toolSelection');					//tool choice indicator element
const layerSelButtons = document.querySelectorAll('.layerSelButton');			//work layer selection buttons
const layerVisIndicators = document.querySelectorAll('.layerVisIndicator');		//layer visibility buttons, which double as the layer visibility indicators
const selectedLayerIndicator = document.getElementById('layerSelection');		//work layer indicator element
const editorSettings = document.querySelectorAll('.editorSettings');			//editor settings buttons
const levelSizeForm = document.getElementById('levelSizeForm');					//level size form
const widthField = document.getElementById('screensWide');
const heightField = document.getElementById('screensTall');
const levelNameForm = document.getElementById('levelNameForm');
const levelNameField = document.getElementById('levelName');
const pageTitle = document.querySelector('title');
const levelTxtSelect = document.getElementById('importLevel')

//arrays & canvases
const mainCtx = screen.getContext('2d');							//canvas rendering context for the main display
const atlasCanvas = new OffscreenCanvas(29 * tileCount * 2, 29);	//offScreenCanvas which stores the tiles that are bitmaps
let levelArray;														//array that stores all the data of the level. each array contained within this one is one layer of the level data
let visArray = new Array(layerCount).fill(1);						//array that stores the layer visibility choice for each layer
let selArray;														//array that stores the current selection. structured similar to the levels array but without layers, and only as many components as the source selection
let clipBoard;
const atlasCtx = atlasCanvas.getContext('2d');						//canvas rendering context for the atlas's canvas

//mouse vars
let mouseTileX = 0;					//stores the x value of the current grid cell that the mouse is over...
let mouseTileY = 0;					//same but for the y value
let prevMouseX = 0;					//stores the previous tileX that the mouse was over
let prevMouseY = 0;					//same but for y
let isMouseDown = false;
let mouseInsideSel = false;
let mouseTileChanged = false;		//true if the mouse tile changed since the last mousemove event, false if it didn't change
let mouseXInsideLevel = false;
let mouseYInsideLevel = false;


function initMainCanvas() {								//sets the size of the main canvas based on some vars
	screen.width = 1400 //customScreenWidth * baseTileSize;
	screen.height = 800 //customScreenHeight * baseTileSize;
}

function initLevelArray() {					//structure: [root: [layer 1: [0 poles], [1 base geo], [2 items], [3 tunnels]], [layer 2: [0 poles], [1 base geo]], [layer 3: [0 poles], [1 base geo]]
	function createLayerComponents(layer, compCount) {
		for (let i = 0; i < compCount; i++) {
			levelArray[layer].push(new Array());
			for (let j = 0; j < tilesPerRow; j++) {
				levelArray[layer][i].push(new Array(tilesPerColumn).fill(0));
			}
		}
	}
	
	levelArray = new Array();
	for (let i = 0; i < layerCount; i++) {		//layer components are structured like [[col1]...[col999]]
		levelArray.push(new Array());
	}
	createLayerComponents(0, 4);
	createLayerComponents(1, 2);
	createLayerComponents(2, 2);
}

function initAtlas() {							//initializes the atlas with the tileset in 'resources/tiles.png'
	const atlasSrc = new Image();
	atlasSrc.src = 'resources/tiles.png';
	atlasSrc.onload = function() {
		atlasCtx.drawImage(atlasSrc, 0, 0);
		drawVisLevel();
		console.log('initialized atlas!');
	}
}

function drawFromAtlas(atlasIndex, x, y) {		//copies a specified tile from the atlas to a specified location on the display
	const atlasX = atlasIndex * 29;
	mainCtx.drawImage(atlasCanvas, atlasX, 0, 29, 29, x, y, tileSize, tileSize);
}

function getGridPos(event) {					//gets the position of the mouse and updates a bunch of related vars
	let prevX = mouseTileX;
	let prevY = mouseTileY;
	let tileX = Math.floor((event.offsetX - panX) / tileSize);
	let tileY = Math.floor((event.offsetY - panY) / tileSize);
	mouseXInsideLevel = ((tileX >= 0) && (tileX < tilesPerRow));
	mouseYInsideLevel = ((tileY >= 0) && (tileY < tilesPerColumn));
	mouseInsideSel = (tileX >= selStartX) && (tileX < selEndX) && (tileY >= selStartY) && (tileY < selEndY)
	if (mouseXInsideLevel) {
		mouseTileX = tileX;
	}
	if (mouseYInsideLevel) {
		mouseTileY = tileY;
	}
	if ((prevX === mouseTileX) && (prevY === mouseTileY)) {
		mouseTileChanged = false;
	}
	else {
		mouseTileChanged = true;
		prevMouseX = prevX;
		prevMouseY = prevY;
	}
}

function chooseCursor() {
	let cursor;
	switch (toolChoice) {
		case 0:
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'url("resources/pencilCursor.png"), crosshair';
			} else {
				cursor = 'default';
			}
		break
		case 1:
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'crosshair';
			} else {
				cursor = 'default';
			}
		break
		case 3:
			if ((mouseTileX === playStartX && mouseTileY === playStartY) || ((mouseTileX + 1) === playEndX && (mouseTileY + 1) === playEndY)) {
				cursor = 'nwse-resize';
			}
		break
		case 4:
			if (isMouseDown || ! mouseInsideSel) {
				cursor = 'crosshair';
			} else {
				cursor = 'move';
			}
		break
		case 5:
			//camera cursors
		break
		case 6:
			cursor = 'crosshair';
		break
		case 7:
			cursor = 'crosshair';
		break
		case 8:
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'url("resources/erasorCursor.png"), crosshair';
			} else {
				cursor = 'default';
			}
		break
	}
	screen.setAttribute('style', `cursor: ${cursor}`);
}

function drawLine(x1, y1, x2, y2, color, width) {
	mainCtx.lineWidth = width;
	mainCtx.strokeStyle = color;
	mainCtx.beginPath();
	mainCtx.moveTo(x1, y1);
	mainCtx.lineTo(x2, y2);
	mainCtx.stroke();
}

function drawRect(color, x, y, w, h) {			//draws a rectangle of width w and height h, or a square if h is not provided
	if (h === undefined) {
		h = w;
	}
	mainCtx.fillStyle = color;
	mainCtx.fillRect(x, y, w , h);
}

function clearScreen() {						//clears the screen
	drawRect(backgroundColor, 0, 0, screen.width, screen.height);
}

function handleLevelsizeChange(event) {
    event.preventDefault();
    const width = parseInt(widthField.value);
    const height = parseInt(heightField.value);
    const levelArea = width * height;
    switch (levelArea <= 12 && levelArea > 0) {
        case true:
            screensWide = width;
			screensTall = height;
			let prevTilesPerRow = tilesPerRow;
			let prevTilesPerColumn = tilesPerColumn;
			tilesPerRow = (width * 72) - ((width - 1) * 5);
            tilesPerColumn = (height * 43) - ((height - 1) * 3);
			let widthDif = tilesPerRow - prevTilesPerRow;
			let heightDif = tilesPerColumn - prevTilesPerColumn;
				if (widthDif < 0) {
					console.log(`removing ${widthDif} tiles from the width`);
					levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.pop();
							}
						})
					})
				} else if (widthDif > 0) {
					console.log(`adding ${widthDif} tiles to the width`);
					levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.push(new Array(tilesPerColumn).fill(0));
							}
						})
					})
				}
				if (heightDif < 0) {
					console.log(`removing ${heightDif} tiles from the height`);
					levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							layerComponent.forEach((column) => {
								for (i = 0; i < Math.abs(heightDif); i++) {
									column.pop();
								}
							})
						})
					})
				} else if (heightDif > 0) {
					console.log(`adding ${heightDif} tiles to the height`);
					levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							layerComponent.forEach((column) => {
								for (i = 0; i < Math.abs(heightDif); i++) {
									column.push(0);
								}
							})
						})
					})
				}
            drawVisLevel();
        break 
        case false:
            switch (levelArea <= 0) {
                case true:
                    alert('Level size can\'t be zero or negative!!!!!!!');
                break
                case false:
                    alert('Level size too big!\nthe total number of screens must be 12 or lower');
                break
            }
        break
    }
}

function handleNameChange(event) {
	event.preventDefault();
	levelName = levelNameField.value;
	pageTitle.innerText = levelName;
}

function changeTool(tool) {
	selBox = false;
	let toolName
	switch (tool) {
		case 'paint':
			toolChoice = 0;
			toolName = 'Paint';
			previewChoice = true;
		break
		case 'eraser':
			toolChoice = 8;
			toolName = 'Erase'
			previewChoice = true
		break
		case 'boxFill':
			toolChoice = 1;
			toolName = 'Box fill';
			previewChoice = true;
		break
		case 'playEdit':
			toolChoice = 3;
			toolName = 'play area editor';
			previewChoice = true;
		break
		case 'boxSelect':
			toolChoice = 4;
			toolName = 'box select';
			previewChoice = false;
			selBox = true;
		break
		case 'cameras':
			toolChoice = 5;
			toolName = 'CAmera editor';
			previewChoice = false;
		break
		case 'ruler':
			toolChoice = 6;
			toolName = 'ruler'
			previewChoice = false;
		break
		case 'eraseAll':
			toolChoice = 7;
			toolName = 'box erase';
			previewChoice = false;
		break
	}
	toolIndicator.innerText = toolName;
	toolButtons.forEach(button => {
		button.setAttribute('selected', 'false');
		if (button.id === tool) {
			button.setAttribute('selected', 'true')
		}
	});
	drawVisLevel();
}

function moveSel(event) {
	event.preventDefault();
	selStartX = mouseTileX - mouseOffsetX;
	selStartY = mouseTileY - mouseOffsetY;
	selEndX = selStartX + selArray[0].length;
	selEndY = selStartY + selArray[0][0].length;
	if (selStartX <= 0) {
		selStartX = 0;
		selEndX = selArray[0].length;
	}
	if (selStartY <= 0) {
		selStartY = 0;
		selEndY = selArray[0][0].length;
	}
	if (selEndX >= tilesPerRow) {
		selStartX = tilesPerRow - selArray[0].length;
		selEndX = tilesPerRow;
	}
	if (selEndY >= tilesPerColumn) {
		selStartY = tilesPerColumn - selArray[0][0].length;
		selEndY = tilesPerColumn;
	}
	drawVisLevel();
}

function clearSelection() {
	levelArray[layerChoice].forEach(layerComponent => {
		for (let x = selStartX; x < selEndX; x++) {
			for (let y = selStartY; y < selEndY; y++) {
				layerComponent[x].splice(y, 1, 0);
			}
		}
	});
}

function placeSelection() {
	selArray.forEach((layerComponent, componentIndex) => {
		layerComponent.forEach((column, x) => {
			column.forEach((value, y) => {
				if (layerChoice != 0) {
					if (componentIndex > 1) {
					} else {
						if (airReplace) {
							levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						} else if (value != 0) {
							levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						}
					}
				} else {
					if (airReplace) {
						levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
					} else if (value != 0) {
						levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
					}
				}
			})
		})
	})
}

function drawSelBox() {
	if (selBox) {
		switch (toolChoice) {
			case 1:
				color = boxFillColor;
				width = 1;
			break
			case 4:
				color = selColor;
				width = 3;
			break
			case 7:
				color = boxDeleteColor;
				width = 5;
			break
		}
		mainCtx.strokeStyle = color;
		mainCtx.lineWidth = width;
		mainCtx.strokeRect((selStartX * tileSize) + panX - 0.5, (selStartY * tileSize) + panY - 0.5, (selEndX - selStartX) * tileSize, (selEndY - selStartY) * tileSize);
	}
}

function drawLevelOutline() {
	mainCtx.strokeStyle = levelBorderColor;
	mainCtx.lineWidth = 2;
	mainCtx.strokeRect(panX, panY, tileSize * tilesPerRow, tileSize * tilesPerColumn);
}

function drawPlayAreaOutline() {
	mainCtx.strokeStyle = playColor;
	mainCtx.lineWidth = 4;
	mainCtx.strokeRect((playStartX * tileSize) + panX, (playStartY * tileSize) + panY, (playEndX - playStartX) * tileSize, (playEndY - playStartY) * tileSize);
}

function drawGrid() {
	if (showGrid) {
		for (let i = 1; i < tilesPerRow; i++) {
		const ts = i * tileSize;
		drawLine(ts + panX - 0.5, panY, ts + panX - 0.5, (tileSize * tilesPerColumn) + panY, gridColor, 1);
		}
		for (let i = 1; i < tilesPerColumn; i++) {
		const ts = i * tileSize;
		drawLine(panX, ts + panY - 0.5, (tileSize * tilesPerRow) + panX, ts + panY - 0.5, gridColor, 1);
		}
	}
}

function drawTri(x, y, s, color, facing) {				//draws a right triangle with both legs being length s 
	mainCtx.beginPath();									 //facing can be ul, dl, ur, dr, ct, cl, cb, cr (up-left, down-left, up-right, down-right, center-top, center-left, center-bottom, center-right)
	switch (facing) {
		case 'dl':
			mainCtx.moveTo(x, y);
			mainCtx.lineTo(x, y + s);
			mainCtx.lineTo(x + s, y + s);
		break
		case 'ul':
			mainCtx.moveTo(x, y);
			mainCtx.lineTo(x, y + s);
			mainCtx.lineTo(x + s, y);
		break
		case 'dr':
			mainCtx.moveTo(x + s, y);
			mainCtx.lineTo(x, y + s);
			mainCtx.lineTo(x + s, y + s);
		break
		case 'ur':
			mainCtx.moveTo(x + s, y);
			mainCtx.lineTo(x, y);
			mainCtx.lineTo(x + s, y + s);
		break
		case 'cb':
			mainCtx.moveTo(x + (s / 2), y + (0.8 * s))
			mainCtx.lineTo(x + (s / 3), y + (0.4 * s))
			mainCtx.lineTo(x + ((s / 3) * 2), y + (0.4 * s))
		break
		case 'ct':
			mainCtx.moveTo(x + (s / 2), y + (0.2 * s))
			mainCtx.lineTo(x + (s / 3), y + (0.6 * s))
			mainCtx.lineTo(x + ((s / 3) * 2), y + (0.6 * s))
		break
		case 'cl':
			mainCtx.moveTo(x + (0.2 * s), y + (s / 2))
			mainCtx.lineTo(x + (0.6 * s), y + (s / 3))
			mainCtx.lineTo(x + (0.6 * s), y + ((s / 3) * 2))
		break
		case 'cr':
			mainCtx.moveTo(x + (0.8 * s), y + (s / 2))
			mainCtx.lineTo(x + (0.4 * s), y + (s / 3))
			mainCtx.lineTo(x + (0.4 * s), y + ((s / 3) * 2))
		break
	}
	mainCtx.closePath();
	mainCtx.fillStyle = color;
	mainCtx.fill();
}

function drawValue(value, tileX, tileY, mode) {			//draws the chosen tile at the chosen location. mode can be 0 for array draw mode or 1 for preview draw mode. 
	let atlasMod;										//additional modes are for coloring layers differently from each other 
	let color;
	x = (tileX * tileSize) + panX;
	y = (tileY * tileSize) + panY;
	switch (mode) {
		case 0:											//layer 0 draw mode
			color = layer1Color;
			atlasMod = 0;
		break
		case 1:											//layer 1 draw mode
			color = layer2Color;
			atlasMod = 0;
		break
		case 2:											//layer 2 draw mode
			color = layer3Color;
			atlasMod = 0;
		break
		case undefined:									//preview draw mode
			color = previewColor;
			atlasMod = tileCount;
	}
	switch (value) {
		case 0:											//draw nothing for air
		break
		case 1:
			drawRect(color, x, y, tileSize);			//wall
		break
		case 2:
			drawTri(x, y, tileSize, color, 'dl');		//down-left slope
		break
		case 3:
			drawTri(x, y, tileSize, color, 'ul');		//up-left slope
		break
		case 4: 
			drawTri(x, y, tileSize, color, 'ur');		//up-right slope
		break
		case 5:
			drawTri(x, y, tileSize, color, 'dr');		//down-right slope
		break
		case 6:
			drawFromAtlas(9 + atlasMod, x, y);			//cool scug yea
		break
		case 7:
			drawRect(color, x, y + tileSize / 2 - tileSize / 10, tileSize, tileSize / 5);			//vertical pole
		break
		case 8:
			drawRect(color, x + tileSize / 2 - tileSize / 10, y, tileSize / 5, tileSize);			//horizontal pole
		break
		case 9:
			drawRect(color, x, y + tileSize / 2 - tileSize / 10, tileSize, tileSize / 5);			//cross pole
			drawRect(color, x + tileSize / 2 - tileSize / 10, y, tileSize / 5, tileSize);
		break
		case 10:
			drawRect(color, x, y, tileSize, tileSize / 3);				//semisolid platform
		break
		case 11:
			drawRect(backgroundColor, x, y, tileSize);					//special case for the eraser tool preview
		break
		case 12:
			drawRect('gray', x + tileSize * (3 / 8), y + tileSize * (3 / 8), tileSize / 4);				//shortcut path
		break
		case 14:
			drawFromAtlas(5 + atlasMod, x, y);
		break
		case 15:
			drawFromAtlas(8 + atlasMod, x, y);
		break
		case 16:
			drawFromAtlas(4 + atlasMod, x, y);
		break
		case 17:
			drawFromAtlas(7 + atlasMod, x, y);
		break
		case 18:
			drawFromAtlas(1 + atlasMod, x, y);
		break
		case 19:
			drawFromAtlas(2 + atlasMod, x, y);
		break
		case 20:
			drawFromAtlas(0 + atlasMod, x, y);
		break
		case 21:
			drawFromAtlas(10 + atlasMod, x, y);
		break
		case 22:
			drawRect(deleteColor, x, y, tileSize)
		break
		case 23:
			drawTri(x, y, tileSize, 'gray', 'cr');		//
		break
		case 24:
			drawTri(x, y, tileSize, 'gray', 'cl');
		break
		case 25:
			drawTri(x, y, tileSize, 'gray', 'ct');
		break
		case 26:
			drawTri(x, y, tileSize, 'gray', 'cb');
		break
		case 27:
			drawFromAtlas(11 + atlasMod, x, y);
		break
		case 28:
			drawFromAtlas(12 + atlasMod, x, y);
		break
		case 29:
			drawRect('rgba(200, 200, 255, 0.5)', x, y, tileSize);
		break
	}
}

function drawSelection() {
	if (drawSel === true) {
		selArray.forEach((layerComponent) => {
			layerComponent.forEach((column, x) => {
					column.forEach((value, y) => {
						drawValue(value, x + selStartX, y + selStartY);
					})
			});
		});
	}
}

function addToSelArray() {
	w = selEndX - selStartX;
	h = selEndY - selStartY;
	layer = levelArray[layerChoice];
	selArray = new Array();
	for (let index = 0; index < layer.length; index++) {
		selArray.push(new Array());
		for (let i = 0; i < w; i++) {
			selArray[index].splice(i, 1, new Array(h));
		}
		for (let x = selStartX; x < selEndX; x++) {
			for (let y = selStartY; y < selEndY; y++) {
				selArray[index][x - selStartX].splice(y - selStartY, 1, layer[index][x][y]);
			}
		}
	}
	console.log('added to selection array...')
}

function drawVisValues(x, y) {					//draws all visible values at one tile 
	drawValue(11, x, y);
	for (let i = layerCount - 1; i >= 0; i--) {
		if (visArray[i] === 1) {
			levelArray[i].forEach((layerComponent) => {
				drawValue(layerComponent[x][y], x, y, i);
			});
		}
	}
	drawGrid();
	drawLevelOutline();
	drawPlayAreaOutline();
}

function drawLayerValues(layer) {				//draws the supplied layer
	levelArray[layer].forEach((layerComponent) => {
		layerComponent.forEach((column, x) => {
				column.forEach((value, y) => {
					drawValue(value, x, y, layer);
				})
		});
	});
}

function drawVisLevel() {						//draws only the layers which are set to visible
	clearScreen();
	for (let i = layerCount - 1; i > -1; i--) {
		if (visArray[i] === 1) {
			drawLayerValues(i);
		}
		if (i === layerChoice && visArray[layerChoice] === 1) {
			drawSelection();
		}
	}
	drawGrid();
	drawLevelOutline();
	drawPlayAreaOutline();
	drawSelBox();
}

function addValue(x, y, tileType, autoChoice) {			//autoChoice is true if using the layer component of the global tileChoice or false if using the component of the block-scoped tileType
	let tile;
	switch (autoChoice) {
		case true:
			tile = tileChoice;
		break
		case false:
			tile = tileType;
	}
	switch (tile) {
		case 1:		//wall
		case 2:		//slope
		case 3:		//slope
		case 4:		//slope
		case 5:		//slope
		case 10:	//semisolid platform
		case 18:	//batfly hive
		case 29:
			layerComponentChoice = 1;
		break
		case 6:		//cool slugcat
		case 19:	//waterfall
		case 20:	//worm grass
		case 27:	//spear
		case 28:	//rubbish/rock
			layerComponentChoice = 2;
		break
		case 7:		//horizontal pole
		case 8:		//vertical pole
		case 9:		//cross pole
			layerComponentChoice = 0;
		break
		case 12:	//shortcut path
		case 13:	//shortcut entrance
		case 14:	//creature den
		case 15:	//creature shortcut
		case 16:	//scavenger hole
		case 17:	//garbage worm den
		case 21:	//room exit/entrance
			layerComponentChoice = 3;
		break
	}
	if (mouseXInsideLevel && mouseYInsideLevel) {
		if (visArray[layerChoice] === 1) {
			switch(tileType) {
				default:
					levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, tileType);
				break
				case 7:
				case 8:
				case 9:
					let curTile = levelArray[layerChoice][0][x][y];
					if (curTile != 8 && curTile != 7 && curTile != 9) {
						levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, tileType);
					} else if ((curTile === 7 && tileType === 8) || (curTile === 8 && tileType === 7)) {
						levelArray[layerChoice][0][x].splice(y, 1, 9);
					}
				break
				case 13:
					const adjArray = [levelArray[0][3][x][y - 1], levelArray[0][3][x][y + 1], levelArray[0][3][x - 1][y], levelArray[0][3][x + 1][y]];
					let totalAdj = 0;
					let entranceDir;
					adjArray.forEach((value) => {
						if (value === undefined) {
							value = 0;
						}
						if (value === 12 || value === 14 || value === 15 || value === 16 || value === 21) {
							totalAdj++;
						}
					});
					if ((totalAdj === 1) && (levelArray[0][3][x][y] === 0)) {
						adjArray.forEach((value, index) => {
							if (value != 0) {
								switch (index) {
									case 0:
										entranceDir = 25;
									break
									case 1:
										entranceDir = 26;
									break
									case 2:
										entranceDir = 24;
									break
									case 3:
										entranceDir = 23;
									break
								}
							}
						});
						console.log('aweh9utghaeruhgy9iuoer')
						levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, entranceDir); 
					}
				}			
		}
	}
}

function playEndEdit() {
	if (mouseTileChanged) {
		if (playStartY >= (mouseTileY - 1)) {
			console.log('limiting height!')
			playEndY = playStartY + 2
		}
		else {
			playEndY = mouseTileY + 1;
		}
		if (playStartX >= (mouseTileX - 1)) {
			console.log('limiting height!')
			playEndX = playStartX + 2
		}
		else {
			playEndX = mouseTileX + 1;
		}
	}
	drawVisLevel()
}

function playStartEdit() {
	if (mouseTileChanged) {
		if (playEndY <= (mouseTileY + 1)) {
			console.log('limiting height!')
			playStartY = playEndY - 2
		}
		else {
			playStartY = mouseTileY;
		}
		if (playEndX <= (mouseTileX + 1)) {
			console.log('limiting width!')
			playStartX = playEndX - 2
		}
		else {
			playStartX = mouseTileX;
		}
	}
	drawVisLevel()
}

function rulerFn() {
	if (mouseTileChanged) {
		drawVisLevel()
		selEndX = mouseTileX;
		selEndY = mouseTileY;
		if (selEndX > startTileX) {
			selEndX++;
		}
		if (selEndY > startTileY) {
			selEndY++;
		}
		drawLine(startTileX * tileSize + panX, startTileY * tileSize + panY, selEndX * tileSize + panX, selEndY * tileSize + panY, 'brown', 8)
		let length = Math.round(Math.sqrt((selEndY - startTileY) ** 2 + (selEndX - startTileX) ** 2) * 10) / 10
		mainCtx.fillStyle = 'orange'
		mainCtx.font = '30px rodondo'
		mainCtx.fillText(length, (mouseTileX + 1.5) * tileSize + panX, (mouseTileY) * tileSize + panY)
	}
}

function boxFn() {
	if (mouseTileChanged) {
		preview();
		if (mouseTileX > startTileX) {
			selStartX = startTileX;
			selEndX = mouseTileX + 1;
		}
		if (mouseTileX === startTileX) {
			selStartX = startTileX;
			selEndX = startTileX + 1;
		}
		if (mouseTileX < startTileX) {
			selStartX = mouseTileX;
			selEndX = startTileX + 1;
		}
		
		if (mouseTileY > startTileY) {
			selStartY = startTileY;
			selEndY = mouseTileY + 1;
		}
		if (mouseTileY === startTileY) {
			selStartY = startTileY;
			selEndY = startTileY + 1;
		}
		if (mouseTileY < startTileY) {
			selStartY = mouseTileY;
			selEndY = startTileY + 1;
		}
		drawVisLevel();
	}
}

function paintFn() {
	addValue(mouseTileX, mouseTileY, tileChoice, true)
	if (mouseTileChanged) {
			addValue(mouseTileX, mouseTileY, tileChoice, true);
	}
	drawVisValues(mouseTileX, mouseTileY);
}

function eraseFn() {
	addValue(mouseTileX, mouseTileY, 0, true)
	if (mouseTileChanged) {
			addValue(mouseTileX, mouseTileY, 0, true);
	}
	drawVisValues(mouseTileX, mouseTileY);
}

function pan(event) {
	screen.setAttribute('style', `cursor: all-scroll`);
	panX += event.movementX;
	panY += event.movementY;
	clearScreen();
	drawVisLevel();
}

function preview() {
	if (mouseTileChanged && previewChoice) {
		if (toolChoice === 8) {
			drawValue(22, mouseTileX, mouseTileY)
		}
		else {
			switch (tileChoice) {
				default:
					drawValue(tileChoice, mouseTileX, mouseTileY);
				break
				case 13:
					if (layerChoice === 0) {
						let x = mouseTileX;
						let y = mouseTileY;
						const arr = levelArray[0][3]
						const adjArray = [arr[x][y - 1], arr[x][y + 1], arr[x - 1][y], arr[x + 1][y], arr[x - 1][y - 1], arr[x + 1][y - 1], arr[x + 1][y + 1], arr[x - 1][y + 1]];
						let totalAdj = 0;
						let entranceDir;
						adjArray.forEach((value) => {
							if (value === undefined) {
								value = 0
							}
							if (value === 12 || value === 14 || value === 15 || value === 16 || value === 21) {
								totalAdj++
							}
						});
						if ((totalAdj === 1) && (arr[x][y] === 0)) {
							adjArray.forEach((value, index) => {
								if (value != 0) {
									switch (index) {
										case 0:
											entranceDir = 25;
										break
										case 1:
											entranceDir = 26;
										break
										case 2:
											entranceDir = 24;
										break
										case 3:
											entranceDir = 23;
										break
									}
									drawValue(entranceDir, x, y)
								}
							}); 
						}
					}
				break
			}
		}
		drawVisValues(prevMouseX, prevMouseY);
	}
}

initMainCanvas();

initLevelArray();

initAtlas();

drawVisLevel();

levelTxtSelect.addEventListener('change', () => {
	let ogLevelFile;
	file = levelTxtSelect.files[0]
	const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (event) {
        ogLevelFile = event.target.result;
	}
})

levelSizeForm.addEventListener('submit', handleLevelsizeChange);

levelNameForm.addEventListener('submit', handleNameChange);

layerSelButtons.forEach(button => {					//get the work layer choice any time a cork layer button is pressed
	button.addEventListener('click', () => {
		switch(button.id) {
			case 'layer1':
				layerChoice = 0;
			break
			case 'layer2':
				layerChoice = 1;
			break
			case 'layer3':
				layerChoice = 2;
		}
		drawVisLevel();
		layerSelButtons.forEach(button => {
			button.setAttribute('selected', 'false');
		})
		button.setAttribute("selected", "true");
		console.log(`changed work layer choice to ${layerChoice}`);
		selectedLayerIndicator.innerText = `selected layer: ${layerChoice + 1}`;
	});
});

layerVisIndicators.forEach(button => {
	button.addEventListener('click', () => {
		switch(button.id) {
			case 'layer1':
				switch(visArray[0]) {
					case 0:
						visArray.splice(0, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 1 on');
					break
					case 1:
						visArray.splice(0, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 1 off');
				}   
			break
			case 'layer2':
				switch(visArray[1]) {
					case 0:
						visArray.splice(1, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 2 on');
					break
					case 1:
						visArray.splice(1, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 2 off');
				}
			break
			case 'layer3':
				switch(visArray[2]) {
					case 0:
						visArray.splice(2, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 3 on');
					break
					case 1:
						visArray.splice(2, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 3 off');
				}
		}
		drawVisLevel();
	});
});

tileButtons.forEach(button => {						 //get the tile choice any time a tile button is pressed
	button.addEventListener('click', () => {
		let tileName
		switch(button.id) {
			case 'wall':
				tileChoice = 1;
				tileName = 'wall';
			break
			case 'slope':
				switch(tileChoice) {
					default:
						tileChoice = slopeChoice;
						tileName = 'bottom left slope';
					break
					case 2:
						slopeChoice++;
						tileChoice++;
						tileName = 'top left slope';
					break
					case 3:
						slopeChoice++;
						tileChoice++;
						tileName = 'top right slope';
					break
					case 4:
						slopeChoice = 2;
						tileChoice++;
						tileName = 'bottom right slope';
					break
				}
			break
			case 'batFly':
				tileChoice = 6;
				tileName = 'cool scug :0'
			break 
			case 'hPole':
				tileChoice = 7;
				tileName = 'horizontal pole'
			break
			case 'vPole':
				tileChoice = 8;
				tileName = 'vertical pole'
			break
			case 'crossPole':
				tileChoice = 9;
				tileName = 'cross pole'
			break
			case 'semisolidFloor':
				tileChoice = 10;
				tileName = 'Semisolid Platform'
			break
			//DONT use 11 please. im using it somewhere else,,
			case 'path':
				tileChoice = 12;
				tileName = 'shortcut path';
			break
			case 'entrance':
				tileChoice = 13;
				tileName = 'shortcut entrance';
			break
			case 'dragonDen':
				tileChoice = 14;
				tileName = 'creature den';
			break
			case 'whackamole':
				tileChoice = 15;
				tileName = 'creature shortcut';
			break
			case 'scavHole':
				tileChoice = 16;
				tileName = 'scavenger hole';
			break
			case 'garbageWorm':
				tileChoice = 17;
				tileName = 'garbage worm den';
			break
			case 'hive':
				tileChoice = 18;
				tileName = 'batfly hive';
			break
			case 'waterfall':
				tileChoice = 19;
				tileName = 'waterfall';
			break
			case 'wormGrass':
				tileChoice = 20;
				tileName = 'worm grass';
			break
			case 'roomExit':
				tileChoice = 21;
				tileName = 'room exit/entrance';
			break
			//also dont use 22 please.. .pleaes.. i beg of you,,,
			//wtf also dont use 23, 24, 25, 0r 26... wtf did i d o
			case 'spear':
				tileChoice = 27;
				tileName = 'spear spawn location'
			break
			case 'rock':
				tileChoice = 28;
				tileName = 'rock spawn loaction'
			break
			case 'invisWall':
				tileChoice = 29;
				tileName = 'invisible wall'
		}
		tileIndicator.innerText = tileName;
		tileButtons.forEach(button => {
			button.setAttribute('selected', 'false');
		})
		button.setAttribute("selected", "true")
	});
});

editorSettings.forEach(button => {						//event listener for the editor settings
	button.addEventListener('click', () => {
		switch (button.id) {
			case 'resetView':
				zoomLevel = 1;
				panX = 0;
				panY = 0;
				tileSize = baseTileSize;
				initMainCanvas();
				console.log('reset the view');
			break
			case 'showGrid':
				switch (showGrid) {
					case false:
						showGrid = true;
						button.innerText = 'hide grid';
						console.log('turned grid on');
					break
					case true:
						showGrid = false;
						button.innerText = 'show grid';
						console.log('turned grid off');
				}
			break
			case 'airReplace':
				if (airReplace) {
					button.setAttribute('selected', false);
					airReplace = false;
				} else {
					button.setAttribute('selected', true);
					airReplace = true;
				}
			}
		drawVisLevel();
	});
});

toolButtons.forEach(button => {
	button.addEventListener('click', () => {
		changeTool(button.id);
	});
});

screen.addEventListener('mousemove', getGridPos);   //calculates a bunch of values based on current mouse position to use elsewhere

screen.addEventListener('mousemove', () => {		//draws the preview and updates the cursor type
	preview();
	chooseCursor();
});

screen.addEventListener('mouseleave', () => {		//draws the last mouse tile if the mouse leaves the canvas element
	if (previewChoice) {
		drawVisValues(mouseTileX, mouseTileY);
	}
})

screen.addEventListener('mousedown', (event) => {	   //adds a mousemove event listener when the user clicks on the main canvas for the specified mouse button
	event.preventDefault();
	doingMouseThing = true;
	isMouseDown = true;
	switch (toolChoice) {
		case 1:
		case 4:
		case 7:
		case 6:
			startTileX = mouseTileX;
			startTileY = mouseTileY;
		break
	}
	switch (event.button) {
		case 0:
			switch (toolChoice) {
				case 0:
					paintFn();
					screen.addEventListener('mousemove', paintFn);
				break
				case 8:
					eraseFn();
					screen.addEventListener('mousemove', eraseFn);
				break
				case 4:
					if (visArray[layerChoice] === 1) {
						if (drawSel && !mouseInsideSel) {
							placeSelection();
							selStartX = 0;
							selStartY = 0;
							selEndX = 0;
							selEndY = 0;
							selArray = 'fucked up isnt it';
							drawSel = false;
							selBox = false;
						}
					}
					if (drawSel) {
						if (mouseInsideSel) {
							mouseOffsetX = mouseTileX - selStartX;
							mouseOffsetY = mouseTileY - selStartY;
							screen.addEventListener('mousemove', moveSel);
						}
					} else {
						drawSel = false;
						selBox = true;
						screen.addEventListener('mousemove', boxFn);
					}
				break
				case 1:
				case 7:
					selBox = true;
					boxFn();
					screen.addEventListener('mousemove', boxFn);
				break
				case 3:
					if (mouseTileX === playStartX && mouseTileY === playStartY) {
						console.log('fuck');
						screen.addEventListener('mousemove', playStartEdit);
					}
					else {
						if ((mouseTileX + 1) === playEndX && (mouseTileY + 1) === playEndY) {
							console.log('shit');
							screen.addEventListener('mousemove', playEndEdit);
						}
					}
				break
				case 6:
					selBox = false;
					rulerFn();
					screen.addEventListener('mousemove', rulerFn);
				break
			}
		break
		case 1:
			screen.addEventListener('mousemove', pan);
		break
	}
});

document.addEventListener('mouseup', (event) => {			//removes the mousemove event listener when the user is done doing the thing
	isMouseDown = false;
	if (doingMouseThing) {
		doingMouseThing = false;
		screen.removeEventListener('mousemove', paintFn);
		screen.removeEventListener('mousemove', eraseFn);
		screen.removeEventListener('mousemove', pan);
		screen.removeEventListener('mousemove', boxFn);
		screen.removeEventListener('mousemove', rulerFn);
		screen.removeEventListener('mousemove', playEndEdit);
		screen.removeEventListener('mousemove', moveSel);
		screen.removeEventListener('mousemove', playStartEdit);
		chooseCursor();
		if (event.button === 0) {
			switch (toolChoice) {
				case 1:
					if (visArray[layerChoice] === 1) {
						for (let x = selStartX; x < selEndX; x++) {
							for (let y = selStartY; y < selEndY; y++) {
								addValue(x, y, tileChoice, true);
							}
						}
					}
					selBox = false;
					selStartX = 0;
					selStartY = 0;
					selEndX = 0;
					selEndY = 0;
				break
				case 4:
					console.log(startTileX, selEndX);
					if (!drawSel && selEndX + selEndY > 0) {
						addToSelArray();
						clearSelection();
						drawSel = true;
					}
				break
				case 7:
					if (visArray[layerChoice] === 1) {
						levelArray[layerChoice].forEach(layerComponent => {
							for (let x = selStartX; x < selEndX; x++) {
								for (let y = selStartY; y < selEndY; y++) {
									layerComponent[x].splice(y, 1, 0);
								}
							}
						});
					}
					selBox = false;
					selStartX = 0;
					selStartY = 0;
					selEndX = 0;
					selEndY = 0;
				break 
				case 6:
					selBox = false;
					selStartX = 0;
					selStartY = 0;
					selEndX = 0;
					selEndY = 0;
			}
		}
		drawVisLevel();
	}
});
