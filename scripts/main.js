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
let zoomLevel = -4;							//stores the zoom level of the editor
let baseTileSize = 24;						//base size of each tile in pixels
let tileSize = zoomLevel + baseTileSize;	//the final tile size in pixels with zoom taken into account
let panX = 25;								//stores the x position in pixels that the user has moved the display to
let panY = 52;								//same, but for the y axis
editorSave.backgroundColor = '#ffffff';
editorSave.gridColor = '#c8c8c8';
editorSave.playColor =	'#ff7f7f';			//color of the play area's border
editorSave.selBoxColor = '#c0ad06';							//color of the selection box
editorSave.selBodyColor = "#88a1d8"
editorSave.levelBorderColor = '#7f7fff';
editorSave.layer1Color = '#000000';
editorSave.layer2Color = '#c8ffc8';
editorSave.layer3Color = '#e2a0a0';
editorSave.previewColor = '#969696';	//color of the tile preview when certain tools are selected, if the tile being previewed supports custom colors
editorSave.deleteColor = '#ffc8c8';	//color of the tile preview when erase tool is selected
editorSave.boxFillColor = '#ff0000';						//color of the box fill selection border
editorSave.boxDeleteColor = '#ff0000';						//color of the box erase selection border
editorSave.toolsHiddenSetting = 'false';			//weird fake booleans because you cant have booleans in css
editorSave.settingsHiddenSetting = 'true';
let colorToChange = "backgroundColor";
let mouseCoordSize = {"width" : 0, "height" : 0};
editorSave.showGrid = true;						    //whether or not to show the grid
editorSave.showCoords = false;
let previewChoice = true;							//whether or not to show the preview at the current mouse tile

//tool and tile settings 
let tileChoice = 1;
let toolChoice = 'paint';
let layerChoice = 0;						//stores the current work layer
let slopeChoice = 2;
editorSave.autoSlope = false;
let doingMouseThing = false;				//true if a mousedown event was fired on the editor's canvas, used to prevent unrelated mouseup events from affecting the ui
let currentOperation = 0;                   //used for defining what level edits should be contained inside an "operation", for undo purposes...
let undoArray = [];

//selection
let selBox = false;							//whether or not to show the selection box
let drawSel = false;						//whether or not to draw the selection itself, if it exists
editorSave.airReplace = false;						//whether or not to replace base tiles with air in the selection when placing
let startTileX = 0;							//the tile that was first clicked on with any tool that uses boxFn()
let startTileY = 0;
let selStartX = 0;							//selection starting coords
let selStartY = 0;
let selEndX = 0;							//selection ending coords
let selEndY = 0;
let mouseOffsetX = 0;						//the offset of the mouse from the selection starting corner when clicking on the inside of the selection to move it
let mouseOffsetY = 0;
let selArray = [];														//array that stores the current selection. structured similar to the levels array but without layers, and only as many components as the source selection
levelSave.clipBoard = [];

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
const levelTxtSelect = document.getElementById('importLevel');
const levelExportButton = document.getElementById('exportLevel')
const editorColorSelect = document.getElementById('editorColorSelector');
const editorColorPicker = document.getElementById('editorColorPicker');
const editorColorReset = document.getElementById("editorColorReset");

//arrays & canvases
const mainCtx = screen.getContext('2d');							//canvas rendering context for the main display
const atlasCanvas = new OffscreenCanvas(29 * tileCount * 2, 29);	//offScreenCanvas which stores the tiles that are bitmaps
levelSave.levelArray = [];														//array that stores all the data of the level. each array contained within this one is one layer of the level data
const visArray = new Array(layerCount).fill(1);						//array that stores the layer visibility choice for each layer
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

function strictEquals(obj1, obj2) {
    if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
        return true
    } else {
        return false
    }
}

function initOgLevelFile() {
    fetch("./template project.json").then((res) => {
        return res.json();
    }).then((data) => {
        ogLevelFile.string = data.fileStr;
        ogLevelFile.parsed = parseOriginalLevel(ogLevelFile.string)
    });
}

function arrLooseEquals(arr1, arr2) {                   //loose in the sense that it doesn't care about the order of the elements
    let boolean = true;
    if (Array.isArray(arr1) && Array.isArray(arr2)) {
        if (arr1.length === arr1.length) {
            arr1.forEach((value) => {
                if (!arr2.includes(value)) {
                    boolean = false;
                }
            })
        } else {
            return false;
        }
        return boolean;
    } else {
        throw new Error("arrLooseEquals only accepts arrays")
    }
}

function looseEquals(obj1, obj2) {          //loose in the sense that it only cares that a key exists, rather than the values being the same
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    let boolean = true;
    if (keys2.length === keys1.length) {
        keys1.forEach((key) => {
            if (!keys2.includes(key)) {
                boolean = false;
            }
        })
    } else {
        return false;
    }
    return boolean;
}

function initHtmlElements() {
    changeToolboxState('tools', editorSave.toolsHiddenSetting);
    changeToolboxState('settings', editorSave.settingsHiddenSetting);
    editorColorPicker.value = editorSave.backgroundColor;
    editorSettingsButtons.forEach(button => {						//event listener for the editor settings
        if (button.id != 'resetView') {
            if (editorSave[button.id]) {
                button.setAttribute('selected', "true");
            } else {
                button.setAttribute('selected', "false");
            }
        }
    });
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
    if (settings && looseEquals(settings, editorSave)) {
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
	} else if (looseEquals(settings, levelSave)) {
		if (confirm('Do you really want to load the saved level?\nThis will delete the current level')) {
			levelSave = JSON.parse(localStorage.getItem('levelSettings'));
			handleNameChange(levelSave.levelName);
            undoArray = [];
            currentOperation = 0;
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
	let mouseOutsideLeft = tileX < 0
    let mouseOutsideRight = tileX > levelSave.tilesPerRow - 1
    let mouseOutsideTop = tileY < 0
    let mouseOutsideBottom = tileY > levelSave.tilesPerColumn - 1
    mouseXInsideLevel = !mouseOutsideLeft && !mouseOutsideRight;
	mouseYInsideLevel = !mouseOutsideTop && !mouseOutsideBottom;
    mouseInsideSel = (tileX >= selStartX) && (tileX < selEndX) && (tileY >= selStartY) && (tileY < selEndY)
	if (mouseXInsideLevel) {
		mouseTileX = tileX;
	} else if (mouseOutsideLeft) {
        mouseTileX = 0;
    } else if (mouseOutsideRight) {
        mouseTileX = levelSave.tilesPerRow - 1;
    }
	if (mouseYInsideLevel) {
		mouseTileY = tileY;
	} else if (mouseOutsideTop) {
        mouseTileY = 0;
    } else if (mouseOutsideBottom) {
        mouseTileY = levelSave.tilesPerColumn - 1;
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
	const width = parseFloat(widthField.value);
	const height = parseFloat(heightField.value);
	switch (width * height > 0) {
		case true:
			let prevTilesPerRow = levelSave.tilesPerRow;
			let prevTilesPerColumn = levelSave.tilesPerColumn;
			levelSave.tilesPerRow = Math.floor(width * 72);
			levelSave.tilesPerColumn = Math.floor(height * 43);
			let widthDif = levelSave.tilesPerRow - prevTilesPerRow;
			let heightDif = levelSave.tilesPerColumn - prevTilesPerColumn;
				if (widthDif < 0) {
					console.log(`${widthDif} tiles from the width`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (let i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.pop();
							}
						})
					})
				} else if (widthDif > 0) {
					console.log(`${widthDif} tiles to the width`);
					levelSave.levelArray.forEach((layer) => {
						layer.forEach((layerComponent) => {
							for (let i = 0; i < Math.abs(widthDif); i++) {
								layerComponent.push(new Array(levelSave.tilesPerColumn).fill(0));
							}
						})
					})
				}
				if (heightDif < 0) {
					console.log(`${heightDif} tiles from the height`);
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
					console.log(`${heightDif} tiles to the height`);
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
            if (levelSave.playEndX > levelSave.tilesPerRow - 1) {
                levelSave.playEndX = levelSave.tilesPerRow - 1
            }
            if (levelSave.playEndY > levelSave.tilesPerColumn - 1) {
                levelSave.playEndY = levelSave.tilesPerColumn - 1
            }
			drawVisLevel();
		break 
		case false:
			alert('Level size can\'t be zero or negative!!!!!!!');
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
            case 'moveView':
                toolName = 'Move view';
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
	levelSave.levelArray[layerChoice].forEach(layerComponent => {
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
							levelSave.levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						} else if (value != 0) {
							levelSave.levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
						}
					}
				} else {
					if (airReplace) {
						levelSave.levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
					} else if (value != 0) {
						levelSave.levelArray[layerChoice][componentIndex][x + selStartX].splice(y + selStartY, 1, value);
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
				color = editorSave.selBoxColor;
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
        case 3:                                         //selection preview draw mode
            color = editorSave.selBodyColor; 
            batflyColor = color;
            atlasMod = tileCount;
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
			if (mode === undefined && editorSave.autoSlope) {
                const adjWallArray = [[], [], []]
                const adjWallTotal = [];
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        if (! (tileY - 1 < 0 || tileY - 1 > levelSave.tilesPerColumn || tileX - 1 < 0 || tileX > levelSave.tilesPerRow)) {
                            adjWallArray[x].push(levelSave.levelArray[layerChoice][1][tileX + x - 1][tileY + y - 1]);
                        } else {
                            adjWallArray[x].push(0);
                        }
                    }
                }
                for (let xCoord = 0; xCoord < 3; xCoord++) {
                    for (let yCoord = 0; yCoord < 3; yCoord++) {
                        function eq(pair) {
                            return strictEquals([xCoord, yCoord], pair)
                        }
                        if (adjWallArray[xCoord][yCoord] === 1 || adjWallArray[xCoord][yCoord] === 29) {
                            if (eq([0, 1])) {
                                adjWallTotal.push(1)
                            } else if (eq([1, 0])) {
                                adjWallTotal.push(2)
                            } else if (eq([2, 1])) {
                                adjWallTotal.push(3)
                            } else if (eq([1, 2])) {
                                adjWallTotal.push(4)
                            }
                        }
                    }
                }
                if (adjWallTotal.length === 2 && adjWallArray[1][1] === 0) {
                    function eq(pair) {
                        return arrLooseEquals(adjWallTotal, pair)
                    }
                    if (eq([1, 4])) {
                        drawTri(x, y, tileSize, color, 'dl');
                    } else if (eq([1, 2])) {
                        drawTri(x, y, tileSize, color, 'ul');
                    } else if (eq([2, 3])) {
                        drawTri(x, y, tileSize, color, 'ur');
                    } else if (eq([3, 4])) {
                        drawTri(x, y, tileSize, color, 'dr');
                    }
                }
            } else {
                drawTri(x, y, tileSize, color, 'dl');
            }
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
			let adjWallTotal = 0;
            let adjPathTotal = 0;
			let entranceDir;
			let pathPos = [0, 0];
            let oppositeTile;
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					if (! (tileY - 1 < 0 || tileY - 1 > levelSave.tilesPerColumn || tileX - 1 < 0 || tileX > levelSave.tilesPerRow)) {
                        adjPathArray[x].push(levelSave.levelArray[0][3][tileX + x - 1][tileY + y - 1]);
					    adjWallArray[x].push(levelSave.levelArray[0][1][tileX + x - 1][tileY + y - 1]);
                    } else {
                        adjPathArray[x].push(0);
					    adjWallArray[x].push(0);
                    }
				}
			}
			for (let xCoord = 0; xCoord < 3; xCoord++) {
				for (let yCoord = 0; yCoord < 3; yCoord++) {
					if (! (xCoord === 1 && yCoord === 1)) {
                        function eq(a) {
                            return strictEquals([xCoord, yCoord], a);
                        }
                        if ((eq([0, 1]) || eq([1, 0]) || eq([2, 1]) || eq([1, 2])) && adjPathArray[xCoord][yCoord]) {
                            pathPos = [xCoord, yCoord];
                            adjPathTotal++
						}
                        if (adjWallArray[xCoord][yCoord] === 1 || adjWallArray[xCoord][yCoord] === 29) {
                            adjWallTotal++;
                        }
					}
				}
			}
			drawRect(color, x, y, tileSize);
            if (strictEquals(pathPos, [1, 0])) {
                oppositeTile = adjWallArray[1][2];
                entranceDir = 1;
            } else if (strictEquals(pathPos, [1, 2])) {
                oppositeTile = adjWallArray[1][0];
                entranceDir = 2;
            } else if (strictEquals(pathPos, [0, 1])) {
                oppositeTile = adjWallArray[2][1];
                entranceDir = 3;
            } else if (strictEquals(pathPos, [2, 1])) {
                oppositeTile = adjWallArray[0][1];
                entranceDir = 4;
            } else {
                entranceDir = null;
            }
            if (entranceDir && adjPathTotal === 1 && adjWallTotal === 7 && oppositeTile === 0 || oppositeTile === 10) {
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
			drawFromAtlas(13, x, y, tileSize)
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
						drawValue(value, x + selStartX, y + selStartY, 3);
					})
			});
		});
	}
}

function addToSelArray() {
	let w = selEndX - selStartX;
	let h = selEndY - selStartY;
	let layer = levelSave.levelArray[layerChoice];
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
        case 13:	//shortcut entrance
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

function addValue(layer, layerComponentChoice, x, y, tileType) {
    function didAlreadyEditTile() {
        return (levelSave.levelArray[layer][layerComponentChoice][x][y] === tileType)
    }

    if (undoArray.length - 1 > currentOperation) {
        undoArray.length = currentOperation + 1;
    }
    //just to prevent the array from getting too too big and using too much memory
    if (undoArray.length > 100000) {
        undoArray.shift();
        currentOperation = undoArray.length - 1;
    }
    if (didAlreadyEditTile() != true) {
        undoArray[currentOperation].push({ 'layer': layer, "component": layerComponentChoice, "oldType": levelSave.levelArray[layer][layerComponentChoice][x][y], "newType": tileType, 'x': x, 'y': y});
    }

    //making sure tiles that should only be on the first layer cannot get outside of the first layer
    if ((layerComponentChoice === 2 || layerComponentChoice === 3) && layer != 0) {
        //console.log("not today. . .")
        console.log(`can't place "${tileMap.numericalIdToName(tileType)}" at layer ${layer + 1}, coords (${x}, ${y})`);
        return
	}
	if (visArray[layer] === 1) {
        switch(tileType) {
            default:
                levelSave.levelArray[layer][layerComponentChoice][x].splice(y, 1, tileType);
            break
            case 2:
                if (editorSave.autoSlope) {
                    const adjWallArray = [[], [], []]
                    const adjWallTotal = [];
                    for (let xCoord = 0; xCoord < 3; xCoord++) {
                        for (let yCoord = 0; yCoord < 3; yCoord++) {
                            if (! (y - 1 < 0 || y - 1 > levelSave.tilesPerColumn || x - 1 < 0 || x > levelSave.tilesPerRow)) {
                                adjWallArray[xCoord].push(levelSave.levelArray[layerChoice][1][x + xCoord - 1][y + yCoord - 1]);
                            } else {
                                adjWallArray[xCoord].push(0);
                            }
                        }
                    }
                    for (let xCoord = 0; xCoord < 3; xCoord++) {
                        for (let yCoord = 0; yCoord < 3; yCoord++) {
                            function eq(pair) {
                                return strictEquals([xCoord, yCoord], pair)
                            }
                            if (adjWallArray[xCoord][yCoord] === 1 || adjWallArray[xCoord][yCoord] === 29) {
                                if (eq([0, 1])) {
                                    adjWallTotal.push(1)
                                } else if (eq([1, 0])) {
                                    adjWallTotal.push(2)
                                } else if (eq([2, 1])) {
                                    adjWallTotal.push(3)
                                } else if (eq([1, 2])) {
                                    adjWallTotal.push(4)
                                }
                            }
                        }
                    }
                    if (adjWallTotal.length === 2 && adjWallArray[1][1] === 0) {
                        function eq(pair) {
                            return arrLooseEquals(adjWallTotal, pair)
                        }
                        if (eq([1, 4])) {
                            levelSave.levelArray[layer][1][x].splice(y, 1, 2);
                        } else if (eq([1, 2])) {
                            levelSave.levelArray[layer][1][x].splice(y, 1, 3);
                        } else if (eq([2, 3])) {
                            levelSave.levelArray[layer][1][x].splice(y, 1, 4);
                        } else if (eq([3, 4])) {
                            levelSave.levelArray[layer][1][x].splice(y, 1, 5);
                        }
                    }
                } else {
                    levelSave.levelArray[layer][1][x].splice(y, 1, 2);
                }
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
		addValue(layerChoice, chooseComponent(tileChoice), mouseTileX, mouseTileY, tileChoice);
	}
	drawVisValues(mouseTileX, mouseTileY);
}

function eraseFn() {
	if (mouseTileChanged) {
		addValue(layerChoice, chooseComponent(tileChoice), mouseTileX, mouseTileY, 0);
	}
	drawVisValues(mouseTileX, mouseTileY);
}

function pan(event) {
	screen.setAttribute('style', `cursor: all-scroll`);
	panX += event.movementX;
	panY += event.movementY;
	drawVisLevel();
}

function drawMouseCoords() {
    if (editorSave.showCoords) {
        let tileNames = "";
        levelSave.levelArray[layerChoice].forEach((component) => {
            if (component[mouseTileX][mouseTileY] != 0) {
                tileNames = tileNames + tileMap.numericalIdToName(component[mouseTileX][mouseTileY]) + ", ";
            }
        })
        mouseCoordSize.height = mouseCoordSize.actualBoundingBoxAscent + mouseCoordSize.actualBoundingBoxDescent;
        let textSize = new Point(Math.ceil(mouseCoordSize.width / tileSize), Math.ceil(mouseCoordSize.height / tileSize));
        if (prevMouseX + textSize.x < levelSave.tilesPerRow && prevMouseY - textSize.y >= 0) { 
            for (let x = 0; x < textSize.x; x++) {
                for (let y = 0; y < textSize.y; y++) {
                    drawVisValues(prevMouseX + x + 1, prevMouseY - y - 1);
                }   
            }  
            preview(); 
        } else {
            drawVisLevel();
            preview();
        }
        mainCtx.fillStyle = 'red'
        mainCtx.font = '15px sans-serif'
        mouseCoordSize = mainCtx.measureText(tileNames + `(${mouseTileX}, ${mouseTileY})`)
        mainCtx.fillText(tileNames + `(${mouseTileX}, ${mouseTileY})`, (mouseTileX + 1) * tileSize + panX, (mouseTileY) * tileSize + panY - 3)
    }
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

window.addEventListener('load', () => {
    initMainCanvas();

    initOgLevelFile();

    initLevelArray();

    loadEditorSettings();

    initAtlas();

    initHtmlElements();

    drawVisLevel();
})

window.addEventListener('resize', () => {
	initMainCanvas();
	drawVisLevel();
})

editorColorSelect.addEventListener('change', () => {
    switch (editorColorSelect.value) {
        case "levelBorder":
            colorToChange = "levelBorderColor";
        break
        case "background":
            colorToChange = "backgroundColor";
        break
        case "playBorder":
            colorToChange = "playColor";
        break
        case "grid":
            colorToChange = "gridColor";
        break
        case "selBox":
            colorToChange = "selBoxColor";
        break
        case "selBody":
            colorToChange = "selBodyColor";
        break
        case "layer1":
            colorToChange = "layer1Color";
        break
        case "layer2":
            colorToChange = "layer2Color";
        break
        case "layer3":
            colorToChange = "layer3Color";
        break
        case "preview":
            colorToChange = "previewColor";
        break

    }
    editorColorPicker.value = editorSave[colorToChange];
})

editorColorPicker.addEventListener('change', () => {
    if (colorToChange) {
        editorSave[colorToChange] = editorColorPicker.value;
        drawVisLevel();
    }
})

editorColorReset.addEventListener('mousedown', () => {
    editorSave.backgroundColor = '#ffffff';
    editorSave.gridColor = '#c8c8c8';
    editorSave.playColor =	'#ff7f7f';
    editorSave.selBoxColor = '#c0ad06';
    editorSave.selBodyColor = "#88a1d8";
    editorSave.levelBorderColor = '#7f7fff';
    editorSave.layer1Color = '#000000';
    editorSave.layer2Color = '#c8ffc8';
    editorSave.layer3Color = '#e2a0a0';
    editorSave.previewColor = '#969696';
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
	button.addEventListener('mousedown', () => {
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
				zoomLevel = 1;
				panX = 0;
				panY = 0;
				tileSize = baseTileSize;
				initMainCanvas();
				console.log('reset the view');
			break
			default:
                if (editorSave[button.id]) {
					button.setAttribute('selected', false);
					editorSave[button.id] = false;
				} else {
					button.setAttribute('selected', true);
					editorSave[button.id] = true;
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

screen.addEventListener('mousemove', (event) => {
	getGridPos(event);                                   //calculates a bunch of values based on current mouse position to use elsewhere
    chooseCursor();
    if (mouseTileChanged) {
        preview();
        drawMouseCoords();
	}
});

screen.addEventListener('mouseleave', () => {		//draws the last mouse tile if the mouse leaves the canvas element
	drawVisLevel();
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
					undoArray.push([]);
                    addValue(layerChoice, chooseComponent(tileChoice), mouseTileX, mouseTileY, tileChoice);
					screen.addEventListener('mousemove', paintFn);
				break
				case 'eraser':
					undoArray.push([]);
                    addValue(layerChoice, chooseComponent(tileChoice), mouseTileX, mouseTileY, 0);
					screen.addEventListener('mousemove', eraseFn);
				break
				case 'boxSelect':
                    if (visArray[layerChoice] === 1) {
						if (drawSel && !mouseInsideSel) {
							undoArray.push([]);
                            placeSelection();
							currentOperation++;
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
					undoArray.push([]);
                    selBox = true;
					boxFn();
					if (toolChoice === 'boxFill') {
                        addValue(layerChoice, chooseComponent(tileChoice), mouseTileX, mouseTileY, tileChoice);
                    }
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
                case 'moveView':
                    screen.addEventListener('mousemove', pan);
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
                    if (visArray[layerChoice] === 1) {
						for (let x = selStartX; x < selEndX; x++) {
							for (let y = selStartY; y < selEndY; y++) {
								addValue(layerChoice, chooseComponent(tileChoice), x, y, tileChoice);
							}
						}
					}
                    currentOperation++;
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
                        currentOperation++;
					}
				break
				case 'eraseAll':
					if (visArray[layerChoice] === 1) {
                        levelSave.levelArray[layerChoice].forEach(layerComponent => {
							for (let x = selStartX; x < selEndX; x++) {
								for (let y = selStartY; y < selEndY; y++) {
									layerComponent[x].splice(y, 1, 0);
								}
							}
						});
					}
                    currentOperation++;
					selBox = false;
					selStartX = 0;
					selStartY = 0;
					selEndX = 0;
					selEndY = 0;
				break
                case 'paint':
                    currentOperation++; 
                break
                case 'eraser':
                    currentOperation++; 
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