"use strict";

//say hi to my horrible code!!!
const tileCount = 20;						//number of unique tiles for the atlas to store
const layerCount = 3;						//stores the number of layers to use
const testStr = 'when the world begins anew, will you wallow like a hog in your own despair, or will you welcome the new world with open wings and a gleeful smile'
let editorSave = {};
let levelSave = {};

//vars which are saved with the level
levelSave.tilesPerRow = 72;						//size of the level
levelSave.tilesPerColumn = 43;
levelSave.playStartX = 12;						//play area starting coordinates
levelSave.playStartY = 3;
levelSave.playEndX = 60							//play area ending coordinates
levelSave.playEndY = 38
levelSave.levelName = 'New Level'
let ogLevelFile = {};									//a string containing the text of the original level file that is currently open

//"visual" settings
editorSave.zoomLevel = -4;							//stores the zoom level of the editor
let baseTileSize = 24;						//base size of each tile in pixels
let tileSize = editorSave.zoomLevel + baseTileSize;	//the final tile size in pixels with zoom taken into account
let panX = 25;								//stores the x position in pixels that the user has moved the display to
let panY = 52;								//same, but for the y axis
editorSave.backgroundColor = 'white';
editorSave.gridColor = 'rgb(200, 200, 200)';
editorSave.playColor =	'rgb(255, 127, 127)';			//color of the play area's border
editorSave.selColor = 'gold';							//color of the selection box
editorSave.levelBorderColor = 'rgb(127, 127, 255';
editorSave.layer1Color = 'rgba(0, 0, 0, 1)';
editorSave.layer2Color = 'rgba(200, 255, 200, 0.7)';
editorSave.layer3Color = 'pink';
editorSave.previewColor = 'rgba(150, 150, 150, 0.5)';	//color of the tile preview when certain tools are selected, if the tile being previewed supports custom colors
editorSave.deleteColor = 'rgba(255, 200, 200, 0.5)';	//color of the tile preview when erase tool is selected
editorSave.boxFillColor = 'red';						//color of the box fill selection border
editorSave.boxDeleteColor = 'red';						//color of the box erase selection border
editorSave.toolsHiddenSetting = 'true';			//weird fake booleans because you cant have booleans in css
editorSave.settingsHiddenSetting = 'true';
editorSave.showGrid = true;						//whether or not to show the grid
let previewChoice = true;							//whether or not to show the preview at the current mouse tile

//tool and tile settings 
let tileChoice = 1;
let toolChoice = 'paint';
editorSave.layerChoice = 0;						//stores the current work layer
let slopeChoice = 2;
editorSave.autoSlope = false;
let doingMouseThing = false;				//true if a mousedown event was fired on the editor's canvas, used to prevent unrelated mouseup events from affecting the ui

//selection
let selBox = false;							//whether or not to show the selection box
let drawSel = false;						//whether or not to draw the selection itself, if it exists
let airReplace = false;						//whether or not to replace base tiles with air in the selection when placing
let startTileX = 0;							//the tile that was first clicked on with any tool that uses boxFn()
let startTileY = 0;
let selStartX = 0;							//selection starting coords
let selStartY = 0;
let selEndX = 0;							//selection ending coords
let selEndY = 0;
let mouseOffsetX = 0;						//the offset of the mouse from the selection starting corner when clicking on the inside of the selection to move it
let mouseOffsetY = 0;
let selArray;														//array that stores the current selection. structured similar to the levels array but without layers, and only as many components as the source selection
levelSave.clipBoard;

//DOM elements
const screen = document.getElementById('editorCanvas');							//the canvas element which forms the main display
const tileButtons = document.querySelectorAll('.tileButton');					//the tile choice buttons
const toolButtons = document.querySelectorAll('.toolButton');					//tool choice buttons
const tileIndicator = document.getElementById('tileSelection');					//the tile choice indicator element
const toolIndicator = document.getElementById('toolSelection');					//tool choice indicator element
const layerSelButtons = document.querySelectorAll('.layerSelButton');			//work layer selection buttons
const layerVisIndicators = document.querySelectorAll('.layerVisIndicator');		//layer visibility buttons, which double as the layer visibility indicators
const selectedLayerIndicator = document.getElementById('layerSelection');		//work layer indicator element
const editorSettingsButtons = document.querySelectorAll('.editorButton');	//editor settings buttons
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
levelSave.levelArray;														//array that stores all the data of the level. each array contained within this one is one layer of the level data
editorSave.visArray = new Array(layerCount).fill(1);						//array that stores the layer visibility choice for each layer
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
	screen.width = window.visualViewport.width;
	screen.height = window.visualViewport.height;
}

function checkForObjectMatch(obj1, obj2) {
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    let boolean = true;
    if (Math.min(keys1.length, keys2.length) === keys1.length) {
        keys1.forEach((key) => {
            if (!keys2.includes(key)) {
                boolean = false;
            }
        })
    } else {
        keys2.forEach((key) => {
            if (!keys1.includes(key)) {
                boolean = false
            }
        })
    }
    return boolean;
}

function initLevelArray() {					//structure: [root: [layer 1: [0 poles], [1 base geo], [2 items], [3 tunnels]], [layer 2: [0 poles], [1 base geo]], [layer 3: [0 poles], [1 base geo]]
	function createLayerComponents(layer, compCount) {
		for (let i = 0; i < compCount; i++) {
			levelSave.levelArray[layer].push(new Array());
			for (let j = 0; j < levelSave.tilesPerRow; j++) {
				levelSave.levelArray[layer][i].push(new Array(levelSave.tilesPerColumn).fill(0));
			}
		}
	}
	
	levelSave.levelArray = new Array();
	for (let i = 0; i < layerCount; i++) {		//layer components are structured like [[col1]...[col999]]
		levelSave.levelArray.push(new Array());
	}
	createLayerComponents(0, 4);
	createLayerComponents(1, 2);
	createLayerComponents(2, 2);
}

function saveEditorSettings() {
	localStorage.setItem('editorSettings', JSON.stringify(editorSave));
}

function loadEditorSettings() {
	let settings = JSON.parse(localStorage.getItem('editorSettings'))
    if (settings && checkForObjectMatch(settings, editorSave)) {
		editorSave = settings;

		drawVisLevel();
	} else {
        console.log('editor settings nonexistent or didnt match the current setup! resaving the editor settings...')
        saveEditorSettings();
    }
}

function saveLevelSettings() {
	if (confirm('Do you really want to save the level?\nThis will delete the previously saved level...')) {
		localStorage.setItem('levelSettings', JSON.stringify(levelSave));
		console.log('saved the level');
	}
}

function loadLevelSettings() {
	let settings = JSON.parse(localStorage.getItem('levelSettings'))
    if (settings === null) {
		alert('cannot load a nonexistent level!!!!')
	} else if (checkForObjectMatch(settings, levelSave)) {
		if (confirm('Do you really want to load the saved level?\nThis will delete the current level')) {
			levelSave = JSON.parse(localStorage.getItem('levelSettings'));
			handleNameChange(levelSave.levelName);
			drawVisLevel();
			console.log('loaded the level :3');

		} 
	} else {
        alert('saved level is corrupt!')
    }
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

function drawFromAtlas(atlasIndex, x, y, size) {		//copies a specified tile from the atlas to a specified location on the display
	const atlasX = atlasIndex * 29;
	mainCtx.drawImage(atlasCanvas, atlasX, 0, 29, 29, x, y, size, size);
}

function getGridPos(event) {					//gets the position of the mouse and updates a bunch of related vars
	let prevX = mouseTileX;
	let prevY = mouseTileY;
	let tileX = Math.floor((event.offsetX - panX) / tileSize);
	let tileY = Math.floor((event.offsetY - panY) / tileSize);
	mouseXInsideLevel = ((tileX >= 0) && (tileX < levelSave.tilesPerRow));
	mouseYInsideLevel = ((tileY >= 0) && (tileY < levelSave.tilesPerColumn));
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
		case 'paint':
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'url("resources/pencilCursor.png"), crosshair';
			} else {
				cursor = 'default';
			}
		break
		case 'boxFill':
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'crosshair';
			} else {
				cursor = 'default';
			}
		break
		case 'playEdit':
			let x = mouseTileX;
            let y = mouseTileY;
            let startX = levelSave.playStartX;
            let startY = levelSave.playStartY;
            let endX = levelSave.playEndX;
            let endY = levelSave.playEndY;
            if ((x === startX && y === startY) || ((x + 1) === endX && (y + 1) === endY)) {
				cursor = 'nwse-resize';
			} else if ((x === startX && y + 1 === endY) || (x + 1 === endX && y === startY)) {
                cursor = 'nesw-resize'
            } else {
                cursor = 'default'
            }
		break
		case 'boxSelect':
			if (isMouseDown || ! mouseInsideSel) {
				cursor = 'crosshair';
			} else if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'move';
			} else {
                cursor = 'default';
            }
		break
		case 'cameras':
			//camera cursors
		break
		case 'eraseAll':
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'crosshair';
			} else {
                cursor = 'default';
            }
		break
		case 'ruler':
			if (mouseXInsideLevel && mouseYInsideLevel) {
				cursor = 'crosshair';
			} else {
                cursor = 'default';
            }
		break
		case 'eraser':
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
	drawRect(editorSave.backgroundColor, 0, 0, screen.width, screen.height);
}

function handleLevelsizeChange(event) {
	event.preventDefault();
	const width = parseInt(widthField.value);
	const height = parseInt(heightField.value);
	const levelArea = width * height;
	switch (levelArea <= 25 && levelArea > 0) {
		case true:
			let prevTilesPerRow = levelSave.tilesPerRow;
			let prevTilesPerColumn = levelSave.tilesPerColumn;
			levelSave.tilesPerRow = (width * 72) - ((width - 1) * 5);
			levelSave.tilesPerColumn = (height * 43) - ((height - 1) * 3);
			let widthDif = levelSave.tilesPerRow - prevTilesPerRow;
			let heightDif = levelSave.tilesPerColumn - prevTilesPerColumn;
				if (widthDif < 0) {
					console.log(`removing ${widthDif} tiles from the width`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (let i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.pop();
							}
						})
					})
				} else if (widthDif > 0) {
					console.log(`adding ${widthDif} tiles to the width`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (let i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.push(new Array(levelSave.tilesPerColumn).fill(0));
							}
						})
					})
				}
				if (heightDif < 0) {
					console.log(`removing ${heightDif} tiles from the height`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							layerComponent.forEach((column) => {
								for (let i = 0; i < Math.abs(heightDif); i++) {
									column.pop();
								}
							})
						})
					})
				} else if (heightDif > 0) {
					console.log(`adding ${heightDif} tiles to the height`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							layerComponent.forEach((column) => {
								for (let i = 0; i < Math.abs(heightDif); i++) {
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

function handleNameChange(name) {
	levelSave.levelName = name 					//.replace(/[^. ._\d\p{L}-]+/ug, ""); to sanitize it. uneccessary lol
	pageTitle.innerText = levelSave.levelName;
	levelNameField.value = levelSave.levelName;
}

function changeTool(toolId) {
	if (typeof(toolId) != 'string') {
		throw new TypeError('Tool id must be a string!')
	} else {
		selBox = false;
		drawSel = false;
		let toolName
		toolChoice = toolId;
		switch (toolId) {
			default:
				throw new Error('Tool does not exist!')
			break
			case 'paint':
				toolName = 'Paint';
				previewChoice = true;
			break
			case 'eraser':
				toolName = 'Erase'
				previewChoice = true
			break
			case 'boxFill':
				toolName = 'Box fill';
				previewChoice = true;
			break
			case 'playEdit':
				toolName = 'play area editor';
				previewChoice = true;
			break
			case 'boxSelect':
				toolName = 'box select';
				previewChoice = false;
				selBox = true;
			break
			case 'cameras':
				toolName = 'CAmera editor';
				previewChoice = false;
			break
			case 'ruler':
				toolName = 'ruler'
				previewChoice = false;
			break
			case 'eraseAll':
				toolName = 'box erase';
				previewChoice = false;
			break
		}
		toolIndicator.innerText = toolName;
		toolButtons.forEach(button => {
			button.setAttribute('selected', 'false');
			if (button.id === toolId) {
				button.setAttribute('selected', 'true')
			}
		});
		drawVisLevel();
	}
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
	if (selEndX >= levelSave.tilesPerRow) {
		selStartX = levelSave.tilesPerRow - selArray[0].length;
		selEndX = levelSave.tilesPerRow;
	}
	if (selEndY >= levelSave.tilesPerColumn) {
		selStartY = levelSave.tilesPerColumn - selArray[0][0].length;
		selEndY = levelSave.tilesPerColumn;
	}
	drawVisLevel();
}

function clearSelection() {
	levelSave.levelArray[editorSave.layerChoice].forEach(layerComponent => {
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
				if (editorSave.layerChoice != 0) {
					if (componentIndex > 1) {
					} else {
						if (airReplace) {
							levelSave.levelArray[editorSave.layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						} else if (value != 0) {
							levelSave.levelArray[editorSave.layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						}
					}
				} else {
					if (airReplace) {
						levelSave.levelArray[editorSave.layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
					} else if (value != 0) {
						levelSave.levelArray[editorSave.layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
					}
				}
			})
		})
	})
}

function drawSelBox() {
	let color;
    let width;
    if (selBox) {
		switch (toolChoice) {
			case 'boxFill':
				color = editorSave.boxFillColor;
				width = 1;
			break
			case 'boxSelect':
				color = editorSave.selColor;
				width = 3;
			break
			case 'eraseAll':
				color = editorSave.boxDeleteColor;
				width = 5;
			break
		}
		mainCtx.strokeStyle = color;
		mainCtx.lineWidth = width;
		mainCtx.strokeRect((selStartX * tileSize) + panX - 0.5, (selStartY * tileSize) + panY - 0.5, (selEndX - selStartX) * tileSize, (selEndY - selStartY) * tileSize);
	}
}

function drawLevelOutline() {
	mainCtx.strokeStyle = editorSave.levelBorderColor;
	mainCtx.lineWidth = 2;
	mainCtx.strokeRect(panX, panY, tileSize * levelSave.tilesPerRow, tileSize * levelSave.tilesPerColumn);
}

function drawPlayAreaOutline() {
	mainCtx.strokeStyle = editorSave.playColor;
	mainCtx.lineWidth = 4;
	mainCtx.strokeRect((levelSave.playStartX * tileSize) + panX, (levelSave.playStartY * tileSize) + panY, (levelSave.playEndX - levelSave.playStartX) * tileSize, (levelSave.playEndY - levelSave.playStartY) * tileSize);
}

function drawGrid() {
	if (editorSave.showGrid) {
		for (let i = 1; i < levelSave.tilesPerRow; i++) {
		const ts = i * tileSize;
		drawLine(ts + panX - 0.5, panY, ts + panX - 0.5, (tileSize * levelSave.tilesPerColumn) + panY, editorSave.gridColor, 1);
		}
		for (let i = 1; i < levelSave.tilesPerColumn; i++) {
		const ts = i * tileSize;
		drawLine(panX, ts + panY - 0.5, (tileSize * levelSave.tilesPerRow) + panX, ts + panY - 0.5, editorSave.gridColor, 1);
		}
	}
}

function drawCustomTri(x, y, width, height, color) {
	mainCtx.beginPath();
	mainCtx.moveTo(x + (width / 2), y + 0.2);
	mainCtx.lineTo(x, y + height);
	mainCtx.lineTo(x + width, y + height);
	mainCtx.closePath();
	mainCtx.fillStyle = color;
	mainCtx.fill();
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
	let batflyColor;
	const x = (tileX * tileSize) + panX;
	const y = (tileY * tileSize) + panY;
	switch (mode) {
		case 0:											//layer 0 draw mode
			color = editorSave.layer1Color;
			batflyColor = color;
			atlasMod = 0;
		break
		case 1:											//layer 1 draw mode
			color = editorSave.layer2Color;
			batflyColor = 'green';
			atlasMod = 0;
		break
		case 2:											//layer 2 draw mode
			color = editorSave.layer3Color;
			batflyColor = color;
			atlasMod = 0;
		break
		case undefined:									//preview draw mode
			color = editorSave.previewColor;
			batflyColor = color;
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
			drawFromAtlas(9 + atlasMod, x, y, tileSize);			//cool scug yea
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
			drawRect(editorSave.backgroundColor, x, y, tileSize);					//special case for the eraser tool preview
		break
		case 12:
			drawRect('gray', x + tileSize * (3 / 8), y + tileSize * (3 / 8), tileSize / 4);				//shortcut path
		break
		case 13:
			let adjPathArray = [[], [], []]
			let adjWallArray = [[], [], []]
			let adjPathTotal;
			let adjWallTotal;
			let entranceDir;
			let pathPos = [0, 0];
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					adjPathArray[x].push(levelSave.levelArray[0][3][tileX + x - 1][tileY + y - 1]);
					adjWallArray[x].push(levelSave.levelArray[0][1][tileX + x - 1][tileY + y - 1]);
				}
			}
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					if (x != 1 && y != 1) {
						if (adjPathArray[x][y] != 0) {
							adjPathTotal++;
							pathPos = [x, y];
						}
						if (adjWallArray[x][y] === 1 || adjWallArray[x][y] === 29) {
							adjWallTotal++;
						}
					}
				}
			}
			drawRect(color, x, y, tileSize);
			if (adjPathTotal === 1 && pathPos[0] + pathPos[1] != 2 || pathPos[0] + pathPos[1] != 4 || pathPos[0] + pathPos[1] != 0) {
				let oppositePos;
				switch (pathPos) {
					case [1, 0]:
						oppositePos = [1, 2];
						entranceDir = 1;
					break
					case [1, 2]:
						oppositePos = [1, 0];
						entranceDir = 2;
					break
					case [0, 1]:
						oppositePos = [2, 1];
						entranceDir = 3;
					break
					case [2, 1]:
						oppositePos = [0, 1];
						entranceDir = 4;
					break
				}
				if (adjWallTotal === 7 && adjWallArray[oppositePos[0]][oppositePos[1]] === 0) {
					switch (entranceDir) {
						case 1:
							drawTri(x, y, tileSize, 'gray', 'ct');
						break
						case 2:
							drawTri(x, y, tileSize, 'gray', 'cb');
						break
						case 3:
							drawTri(x, y, tileSize, 'gray', 'cl');
						break
						case 4:
							drawTri(x, y, tileSize, 'gray', 'cr');
						break
					}
				} else {
					drawFromAtlas(3 + atlasMod, x, y, tileSize);
				}
			} else {
				drawFromAtlas(3 + atlasMod, x, y, tileSize);
			}
		break
		case 14:
			drawFromAtlas(5 + atlasMod, x, y, tileSize);
		break
		case 15:
			drawFromAtlas(8 + atlasMod, x, y, tileSize);
		break
		case 16:
			drawFromAtlas(4 + atlasMod, x, y, tileSize);
		break
		case 17:
			drawFromAtlas(7 + atlasMod, x, y, tileSize);
		break
		case 18:
			for (let i = 0; i < 3; i++) {
				drawCustomTri(x + (tileSize / 3 * i), y, tileSize / 3, tileSize, batflyColor)
			}
		break
		case 19:
			drawFromAtlas(2 + atlasMod, x, y, tileSize);
		break
		case 20:
			drawFromAtlas(0 + atlasMod, x, y, tileSize);
		break
		case 21:
			drawFromAtlas(10 + atlasMod, x, y, tileSize);
		break
		case 22:
			drawRect(editorSave.deleteColor, x, y, tileSize)
		break
		case 27:
			drawFromAtlas(11 + atlasMod, x, y, tileSize);
		break
		case 28:
			drawFromAtlas(12 + atlasMod, x, y, tileSize);
		break
		case 29:
			drawRect('rgba(200, 200, 255, 0.5)', x, y, tileSize);
		break
		case 30:
			drawFromAtlas(13, x, y)
		break
		case 200005:
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
	let w = selEndX - selStartX;
	let h = selEndY - selStartY;
	let layer = levelSave.levelArray[editorSave.layerChoice];
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
		if (editorSave.visArray[i] === 1) {
			levelSave.levelArray[i].forEach((layerComponent) => {
				drawValue(layerComponent[x][y], x, y, i);
			});
		}
	}
	drawGrid();
	drawLevelOutline();
	drawPlayAreaOutline();
}

function drawLayerValues(layer) {				//draws the supplied layer
	levelSave.levelArray[layer].forEach((layerComponent) => {
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
		if (editorSave.visArray[i] === 1) {
			drawLayerValues(i);
		}
		if (i === editorSave.layerChoice && editorSave.visArray[editorSave.layerChoice] === 1) {
			drawSelection();
		}
	}
	drawGrid();
	drawLevelOutline();
	drawPlayAreaOutline();
	drawSelBox();
}

function chooseComponent(tile) {
	let layerComponentChoice = 0;
	switch (tile) {
		case 1:		//wall
		case 2:		//slope
		case 3:		//slope
		case 4:		//slope
		case 5:		//slope
		case 6:		//cool slugcat
        case 10:	//semisolid platform
		case 18:	//batfly hive
		case 29:	//invisible wall
		case 20005: //cracked terrain
			layerComponentChoice = 1;
		break
		case 19:	//waterfall
		case 20:	//worm grass
		case 27:	//spear
		case 28:	//rubbish/rock
		case 30:	//forbid batfly chains
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
	return layerComponentChoice;
}

function addValue(layer, x, y, tileType, autoChoice) {			//autoChoice is true if using the layer component of the global tileChoice or false if using the component of the block-scoped tileType
	//console.log("added tile", tileType, "at layer", layer, ", x", x, ", y", y) //for debug
    let tile;
	switch (autoChoice) {
		default:
			throw new Error('autochoice must be true or false');
		break
		case true:
			tile = tileChoice;
		break
		case false:
			tile = tileType;
	}
	const layerComponentChoice = chooseComponent(tile);
	//making sure tiles that should only be on the first layer cannot get outside of the first layer
    if ((layerComponentChoice === 2 || layerComponentChoice === 3) && layer != 0) {
        console.log("not today. . .")
        return
	}
	if (editorSave.visArray[layer] === 1) {
        switch(tileType) {
            default:
                levelSave.levelArray[layer][layerComponentChoice][x].splice(y, 1, tileType);
            break
            case 7:
            case 8:
            case 9:
                let curTile = levelSave.levelArray[layer][0][x][y];
                if (curTile != 8 && curTile != 7 && curTile != 9) {
                    levelSave.levelArray[layer][layerComponentChoice][x].splice(y, 1, tileType);
                } else if ((curTile === 7 && tileType === 8) || (curTile === 8 && tileType === 7)) {
                    levelSave.levelArray[layer][0][x].splice(y, 1, 9);
                }
            break
        }			
    }
}

function playEdit() {
    if (mouseTileChanged) {
        let x =  mouseTileX;
        let y =  mouseTileY;
        let startX = levelSave.playStartX;
        let startY = levelSave.playStartY;
        let endX = levelSave.playEndX;
        let endY = levelSave.playEndY;
        switch (startCorner) {
            case "tl":
                //top left corner
                if (endY <= (y + 1)) {
                    console.log('limiting height!')
                    levelSave.playStartY = levelSave.playEndY - 2
                }
                else {
                    levelSave.playStartY = mouseTileY;
                }
                if (endX <= (x + 1)) {
                    console.log('limiting width!')
                    levelSave.playStartX = levelSave.playEndX - 2
                }
                else {
                    levelSave.playStartX = mouseTileX;
                }
            break
            case "tr":
                //top right corner
                if (endY <= (y + 1)) {
                    console.log('limiting height!')
                    levelSave.playStartY = levelSave.playEndY - 2
                }
                else {
                    levelSave.playStartY = mouseTileY;
                }
                if (startX >= (x - 1)) {
                    console.log('limiting width!')
                    levelSave.playEndX = levelSave.playStartX + 2
                }
                else {
                    levelSave.playEndX = mouseTileX + 1;
                }
            break
            case "bl":
                //bottom left corner
                if (startY >= (y - 1)) {
                    console.log('limiting height!')
                    levelSave.playEndY = levelSave.playStartY + 2
                }
                else {
                    levelSave.playEndY = mouseTileY + 1;
                }
                if (endX <= (x + 1)) {
                    console.log('limiting width!')
                    levelSave.playStartX = levelSave.playEndX - 2
                }
                else {
                    levelSave.playStartX = mouseTileX;
                }
            break
            case "br":
                //bottom right corner
                if (startY >= (y - 1)) {
                    console.log('limiting height!')
                    levelSave.playEndY = levelSave.playStartY + 2
                }
                else {
                    levelSave.playEndY = mouseTileY + 1;
                }
                if (startX >= (x - 1)) {
                    console.log('limiting width!')
                    levelSave.playEndX = levelSave.playStartX + 2
                }
                else {
                    levelSave.playEndX = mouseTileX + 1;
                }
            break
        }
		drawVisLevel();
	}
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
	if (mouseTileChanged) {
		addValue(editorSave.layerChoice, mouseTileX, mouseTileY, tileChoice, true);
	}
	drawVisValues(mouseTileX, mouseTileY);
}

function eraseFn() {
	if (mouseTileChanged) {
		addValue(editorSave.layerChoice, mouseTileX, mouseTileY, 0, true);
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
	if (previewChoice) {
		drawVisValues(mouseTileX, mouseTileY);
		if (mouseTileChanged) {
			drawVisValues(prevMouseX, prevMouseY);
		}
		if (toolChoice === 'eraser') {
			drawValue(22, mouseTileX, mouseTileY)
		}
		else {
			drawValue(tileChoice, mouseTileX, mouseTileY);
		}
	}
}

initMainCanvas();

initLevelArray();

loadEditorSettings();

initAtlas();

drawVisLevel();

window.addEventListener('resize', () => {
	initMainCanvas();
	drawVisLevel();
})

levelSizeForm.addEventListener('submit', handleLevelsizeChange);

levelNameForm.addEventListener('submit', (event) => {
	event.preventDefault();
	handleNameChange(levelNameField.value)
});

layerSelButtons.forEach(button => {					//get the work layer choice any time a cork layer button is pressed
	button.addEventListener('mousedown', () => {
		switch(button.id) {
			case 'layer1':
				editorSave.layerChoice = 0;
			break
			case 'layer2':
				editorSave.layerChoice = 1;
			break
			case 'layer3':
				editorSave.layerChoice = 2;
		}
		drawVisLevel();
		layerSelButtons.forEach(button => {
			button.setAttribute('selected', 'false');
		})
		button.setAttribute("selected", "true");
		console.log(`changed work layer choice to ${editorSave.layerChoice}`);
		selectedLayerIndicator.innerText = `selected layer: ${editorSave.layerChoice + 1}`;
	});
});

layerVisIndicators.forEach(button => {
	button.addEventListener('mousedown', () => {
		switch(button.id) {
			case 'layer1':
				switch(editorSave.visArray[0]) {
					case 0:
						editorSave.visArray.splice(0, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 1 on');
					break
					case 1:
						editorSave.visArray.splice(0, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 1 off');
				}   
			break
			case 'layer2':
				switch(editorSave.visArray[1]) {
					case 0:
						editorSave.visArray.splice(1, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 2 on');
					break
					case 1:
						editorSave.visArray.splice(1, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 2 off');
				}
			break
			case 'layer3':
				switch(editorSave.visArray[2]) {
					case 0:
						editorSave.visArray.splice(2, 1, 1);
						button.setAttribute('selected', 'true');
						console.log('turned layer 3 on');
					break
					case 1:
						editorSave.visArray.splice(2, 1, 0);
						button.setAttribute('selected', 'false');
						console.log('turned layer 3 off');
				}
		}
		drawVisLevel();
	});
});

tileButtons.forEach(button => {						 //get the tile choice any time a tile button is pressed
	button.addEventListener('mousedown', () => {
		if (button.id === 'slope') {
			tileChoice = slopeChoice;
		} else {
			tileChoice = tileMap.nameToNumericalId(button.id);
		}
		tileIndicator.innerText = tileMap.numericalIdToName(tileChoice);
		tileButtons.forEach(button => {
			button.setAttribute('selected', 'false');
		})
		button.setAttribute("selected", "true");
	});
});

editorSettingsButtons.forEach(button => {						//event listener for the editor settings
	button.addEventListener('mousedown', () => {
		switch (button.id) {
			case 'resetView':
				editorSave.zoomLevel = 1;
				panX = 0;
				panY = 0;
				tileSize = baseTileSize;
				initMainCanvas();
				console.log('reset the view');
			break
			case 'showGrid':
				switch (editorSave.showGrid) {
					case false:
						editorSave.showGrid = true;
						button.innerText = 'hide grid';
						console.log('turned grid on');
					break
					case true:
						editorSave.showGrid = false;
						button.innerText = 'show grid';
						console.log('turned grid off');
				}
			break
			case 'autoSlope':
				if (editorSave.autoSlope) {
					button.setAttribute('selected', false);
					editorSave.autoSlope = false;
				} else {
					button.setAttribute('selected', true);
					editorSave.autoSlope = true;
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
		saveEditorSettings();
		drawVisLevel();
	});
});

toolButtons.forEach(button => {
	button.addEventListener('mousedown', () => {
		changeTool(button.id);
	});
});

screen.addEventListener('mousemove', getGridPos);   //calculates a bunch of values based on current mouse position to use elsewhere

screen.addEventListener('mousemove', () => {		//draws the preview and updates the cursor type
	if (mouseTileChanged) {
		preview();
	}
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
		case 'boxFill':
		case 'boxSelect':
		case 'eraseAll':
		case 'ruler':
        case 'playEdit':
			startTileX = mouseTileX;
			startTileY = mouseTileY;
		break
	}
	switch (event.button) {
		case 0:
			switch (toolChoice) {
				case 'paint':
					addValue(editorSave.layerChoice, mouseTileX, mouseTileY, tileChoice, true)
					screen.addEventListener('mousemove', paintFn);
				break
				case 'eraser':
					addValue(editorSave.layerChoice, mouseTileX, mouseTileY, 0, true)
					screen.addEventListener('mousemove', eraseFn);
				break
				case 'boxSelect':
					if (editorSave.visArray[editorSave.layerChoice] === 1) {
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
				case 'boxFill':
				case 'eraseAll':
					selBox = true;
					boxFn();
					screen.addEventListener('mousemove', boxFn);
				break
				case 'playEdit':
					globalThis.startCorner = undefined;
                    let x =  mouseTileX;
                    let y =  mouseTileY;
                    let startX = levelSave.playStartX;
                    let startY = levelSave.playStartY;
                    let endX = levelSave.playEndX;
                    let endY = levelSave.playEndY;
                    if (x === startX && y === startY) {
                        //top left corner
                        startCorner = "tl";
                    } else if (x + 1 === endX && y === startY) {
                        //top right corner
                        startCorner = "tr";
                    } else if (x === startX && y + 1 === endY) {
                        //bottom left corner
                        startCorner = "bl";
                    } else if (x + 1 === endX && y + 1 === endY) {
                        //bottom right corner
                        startCorner = "br";
                    }
                    if (startCorner) {
                        screen.addEventListener('mousemove', playEdit);
                    }
				break
				case 'ruler':
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
		screen.removeEventListener('mousemove', moveSel);
		screen.removeEventListener('mousemove', playEdit);
		chooseCursor();
		if (event.button === 0) {
			switch (toolChoice) {
				case 'boxFill':
					if (editorSave.visArray[editorSave.layerChoice] === 1) {
						for (let x = selStartX; x < selEndX; x++) {
							for (let y = selStartY; y < selEndY; y++) {
								addValue(editorSave.layerChoice, x, y, tileChoice, true);
							}
						}
					}
					selBox = false;
					selStartX = 0;
					selStartY = 0;
					selEndX = 0;
					selEndY = 0;
				break
				case 'boxSelect':
					console.log(startTileX, selEndX);
					if (!drawSel && selEndX + selEndY > 0) {
						addToSelArray();
						clearSelection();
						drawSel = true;
					}
				break
				case 'eraseAll':
					if (editorSave.visArray[editorSave.layerChoice] === 1) {
						levelSave.levelArray[editorSave.layerChoice].forEach(layerComponent => {
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
				case 'ruler':
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