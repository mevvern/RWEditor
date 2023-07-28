//say hi to my horrible code!!!
let tilesPerRow = 72;
let tilesPerColumn = 43;
let baseTileSize = 20;                                  //base size of each tile in pixels
let playStartX = 12;
let playStartY = 3;
let playEndX = 60
let playEndY = 38
let customScreenWidth = 75;
let customScreenHeight = 40;
const tileCount = 20;                                   //number of unique tiles for the atlas to store
const layerCount = 3;                                   //stores the number of layers to use
let zoomLevel = -4;                                      //stores the zoom level of the editor
let tileSize = zoomLevel + baseTileSize;                            //the final tile size in pixels with zoom taken into account
let panX = 25;                                           //stores the x position in pixels that the user has moved the display to
let panY = 52;                                           //same, but for the y axis
let tileChoice = 1;                                     //stores the current tile choice
let toolChoice = 0;
let layerChoice = 0;                                    //stores the current work layer
let layerComponentChoice = 1;                           //stores which layer component to send a value to...
let showGrid = true;                                    
let slopeChoice = 2;
let previewChoice = true;
let selStartX;
let selStartY;
let selEndX;
let selEndY;

const screen = document.getElementById('editorCanvas');                         //the canvas element which forms the main display
const tileButtons = document.querySelectorAll('.tileButton');                   //the tile choice buttons
const toolButtons = document.querySelectorAll('.toolButton')                    //tool choice buttons
const tileIndicator = document.getElementById('tileSelection');                 //the tile choice indicator element
const toolIndicator = document.getElementById('toolSelection')                  //tool choice indicator element
const layerSelButtons = document.querySelectorAll('.layerSelButton');           //work layer selection buttons
const layerVisIndicators = document.querySelectorAll('.layerVisIndicator');     //layer visibility buttons, which double as the layer visibility indicators
const selectedLayerIndicator = document.getElementById('layerSelection');       //work layer indicator element
const editorSettings = document.querySelectorAll('.editorSettings');            //editor settings buttons
const levelSizeForm = document.getElementById('levelSizeForm');

const mainCtx = screen.getContext('2d');                            //canvas rendering context for the main display
const atlasCanvas = new OffscreenCanvas(29 * tileCount * 2, 29);    //offScreenCanvas which stores the tiles that are bitmaps
let levelArray                                                      //array that stores all the data of the level. each array contained within this one is one layer of the level data
let visArray = new Array(layerCount).fill(1);                       //array that stores the layer visibility choice for each layer
let selArray                                                        //array that stores the current selection. structured similar to the levels array but without layers, and only as many components as the source selection
const atlasCtx = atlasCanvas.getContext('2d');                      //canvas rendering context for the atlas's canvas

let mouseTileX = 0;					//stores the x value of the current grid cell that the mouse is over...
let mouseTileY = 0;					//same but for the y value
let prevMouseX = 0;					//stores the previous tileX that the mouse was over
let prevMouseY = 0;					//same but for y
let mouseTileChanged = false;		//true if the mouse tile changed since the last mousemove event, false if it didn't change
let mouseXInsideLevel = false;
let mouseYInsideLevel = false;


function initMainCanvas() {
	screen.width = customScreenWidth * baseTileSize;
    screen.height = customScreenHeight * baseTileSize;
};

function initLevelArray() {                      //structure: [root: [layer 1: [0 poles], [1 base geo], [2 items], [3 tunnels]], [layer 2: [0 poles], [1 base geo]], [layer 3: [0 poles], [1 base geo]]
    function createLayerComponents(layer, compCount) {
        for (let i = 0; i < compCount; i++) {
            levelArray[layer].push(new Array());
            for (let j = 0; j < tilesPerRow; j++) {
                levelArray[layer][i].push(new Array(tilesPerColumn).fill(0));
            };
        };
    };
    
    levelArray = new Array();
    for (let i = 0; i < layerCount; i++) {       //layer components are structured like [[col1]...[col999]]
        levelArray.push(new Array());
    };
    createLayerComponents(0, 4);
    createLayerComponents(1, 2);
    createLayerComponents(2, 2);
};

function initAtlas() {                              //initializes the atlas with the tileset in 'resources/tiles.png'
    const atlasSrc = new Image();
    atlasSrc.src = 'resources/tiles.png';
    atlasSrc.onload = function() {
        atlasCtx.drawImage(atlasSrc, 0, 0);
        drawVisLevel();
        console.log('initialized atlas!');
    };
};

function drawFromAtlas(atlasIndex, x, y) {       //copies a specified tile from the atlas to a specified location on the display
    const atlasX = atlasIndex * 29;
    mainCtx.drawImage(atlasCanvas, atlasX, 0, 29, 29, x, y, tileSize, tileSize);
};

function getGridPos(event) {                                //gets the position of the mouse and updates a bunch of related vars
    let prevX = mouseTileX;
    let prevY = mouseTileY;
    let tileX = Math.floor((event.offsetX - panX) / tileSize);
    let tileY = Math.floor((event.offsetY - panY) / tileSize);
    mouseXInsideLevel = ((tileX >= 0) && (tileX < tilesPerRow));
    mouseYInsideLevel = ((tileY >= 0) && (tileY < tilesPerColumn));
    if (mouseXInsideLevel) {
        mouseTileX = tileX;
    };
    if (mouseYInsideLevel) {
        mouseTileY = tileY;
    };
    if ((prevX === mouseTileX) && (prevY === mouseTileY)) {
        mouseTileChanged = false;
    }
    else {
        mouseTileChanged = true;
        prevMouseX = prevX;
        prevMouseY = prevY;
    };
};

function drawLine(x1, y1, x2, y2, color, width) {
    mainCtx.lineWidth = width;
    mainCtx.strokeStyle = color;
    mainCtx.beginPath();
    mainCtx.moveTo(x1, y1);
    mainCtx.lineTo(x2, y2);
    mainCtx.stroke();
};

function drawRect(color, x, y, w, h) {                     //draws a rectangle of width w and height h, or a square if h is not provided
    if (h === undefined) {
        h = w;
    };
    mainCtx.fillStyle = color;
    mainCtx.fillRect(x, y, w , h);
};

function clearScreen() {                                //clears the screen
    drawRect('white', 0, 0, screen.width, screen.height);
};

function handleLevelsizeChange(event) {
    event.preventDefault();
    const width = parseInt(document.getElementById('screensWide').value);
    const height = parseInt(document.getElementById('screensTall').value);
    const levelArea = width * height;
    switch (levelArea <= 12 && levelArea > 0) {
        case true:
            tilesPerRow = width * 72;
            tilesPerColumn = height * 43;
            initLevelArray();
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
            };
        break
    };
};

function drawLevelOutline() {
    mainCtx.strokeStyle = 'rgb(127, 127, 255'
    mainCtx.lineWidth = 2
    mainCtx.strokeRect(panX, panY, tileSize * tilesPerRow, tileSize * tilesPerColumn)
};

function drawPlayAreaOutline() {
    mainCtx.strokeStyle = 'rgb(255, 127, 255)'
    mainCtx.lineWidth = 4
    mainCtx.strokeRect((playStartX * tileSize) + panX, (playStartY * tileSize) + panY, (playEndX - playStartX) * tileSize, (playEndY - playStartY) * tileSize)
};

function drawGrid() {
    if (showGrid) {
        for (let i = 1; i < tilesPerRow; i++) {
        const ts = i * tileSize
        drawLine(ts + panX - 0.5, panY, ts + panX - 0.5, (tileSize * tilesPerColumn) + panY, 'rgb(200, 200, 255)', 1)
        }
        for (let i = 1; i < tilesPerColumn; i++) {
        const ts = i * tileSize
        drawLine(panX, ts + panY - 0.5, (tileSize * tilesPerRow) + panX, ts + panY - 0.5, 'rgb(200, 200, 255)', 1)
        }
    }
};

function drawTri(x, y, s, color, facing) {              //draws a right triangle with both legs being length s 
    mainCtx.beginPath();                                     //facing can be ul, dl, ur, dr, ct, cl, cb, cr (up-left, down-left, up-right, down-right, center-top, center-left, center-bottom, center-right)
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
    };
    mainCtx.closePath();
    mainCtx.fillStyle = color;
    mainCtx.fill();
};

function drawValue(value, tileX, tileY, mode) {                 //draws the chosen tile at the chosen location. mode can be 0 for array draw mode or 1 for preview draw mode. 
    let atlasMod;                                               //additional modes are for coloring layers differently from each other 
    let colorA;
    let colorB;
    x = (tileX * tileSize) + panX;
    y = (tileY * tileSize) + panY;
    switch (mode) {
        case 0:                                         //layer 0 draw mode
            colorA = 'rgba(255, 255, 255, 0)'
            colorB = 'rgba(0, 0, 0, 0.7';
            atlasMod = 0;
        break
        case 1:                                         //layer 1 draw mode
            colorA = 'rgba(255, 255, 255, 0)'
            colorB = 'rgba(150, 255, 150, 0.5)'
            atlasMod = 0;
        break
        case 2:                                         //layer 2 draw mode
            colorA = 'rgba(255, 255, 255, 0)'
            colorB = 'rgb(255, 200, 200)'
            atlasMod = 0;

        break
        case undefined:                                         //preview draw mode                                
            colorA = 'rgba(255, 200, 200, 0.5)';
            colorB = 'rgba(127, 127, 127, 0.5)';
            atlasMod = tileCount;
    };
    switch (value) {
        case 0:
        break
        case 1:
            drawRect(colorB, x, y, tileSize);
        break
        case 2:
            drawTri(x, y, tileSize, colorB, 'dl');
        break
        case 3:
            drawTri(x, y, tileSize, colorB, 'ul');
        break
        case 4: 
            drawTri(x, y, tileSize, colorB, 'ur');
        break
        case 5:
            drawTri(x, y, tileSize, colorB, 'dr');
        break
        case 6:
            drawFromAtlas(9 + atlasMod, x, y);
        break
        case 7:
            drawRect(colorB, x, y + tileSize / 2 - tileSize / 10, tileSize, tileSize / 5);
        break
        case 8:
            drawRect(colorB, x + tileSize / 2 - tileSize / 10, y, tileSize / 5, tileSize);
        break
        case 9:
            drawRect(colorB, x, y + tileSize / 2 - tileSize / 10, tileSize, tileSize / 5);
            drawRect(colorB, x + tileSize / 2 - tileSize / 10, y, tileSize / 5, tileSize);
        break
        case 10:
            drawRect(colorB, x, y, tileSize, tileSize / 3);
        break
        case 11:
            drawRect('white', x, y, tileSize);
        break
        case 12:
            drawFromAtlas(6, x, y);
        break
        case 13: 
            drawFromAtlas(3 + atlasMod, x, y); 
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
            drawRect(colorA, x, y, tileSize)
        break
        case 23:
            drawTri(x, y, tileSize, 'gray', 'cr');
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
    };
};

function drawVisValues(x, y) {                //draws all visible values at one tile 
    drawValue(11, x, y);
    for (let layer = layerCount - 1; layer >= 0; layer--) {
        if (visArray[layer] === 1) {
            levelArray[layer].forEach((layerComponent) => {
                drawValue(layerComponent[x][y], x, y, layer);
            });
        };
    };
    drawGrid();
    drawLevelOutline();
    drawPlayAreaOutline();
};

function drawLayerValues(layer) {                   //draws the supplied layer
    levelArray[layer].forEach((layerComponent) => {
        layerComponent.forEach((column, x) => {
                column.forEach((value, y) => {
                    drawValue(value, x, y, layer);
                })
        });
    });
};

function drawVisLevel() {                           //draws only the layers which are set to visible
    clearScreen();
    for (let i = layerCount - 1; i > -1; i--) {
        if (visArray[i] === 1) {
            drawLayerValues(i);
        }
    };
    drawGrid();
    drawLevelOutline();
    drawPlayAreaOutline();
};

function addValue(x, y) {
    let poleValueUnderTile = levelArray[layerChoice][0][x][y];
    let poleIsDifferent = ((poleValueUnderTile === 7 && tileChoice === 8) || (poleValueUnderTile === 8 && tileChoice === 7));
    let willCrossPoleBeReplaced = (poleValueUnderTile === 9) && ((tileChoice === 7) || (tileChoice === 8));
        if (mouseXInsideLevel && mouseYInsideLevel) {
            if (visArray[layerChoice] === 1) {
                switch(poleIsDifferent) {
                    case true:
                        levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, 9);
                    break
                    case false:
                        switch(willCrossPoleBeReplaced) {
                            case false:
                                switch(tileChoice) {
                                default:
                                    levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, tileChoice);
                                break
                                case 13:
                                    const adjArray = [levelArray[0][3][x][y - 1], levelArray[0][3][x][y + 1], levelArray[0][3][x - 1][y], levelArray[0][3][x + 1][y]];
                                    let totalAdj = 0;
                                    let entranceDir;
                                    adjArray.forEach((value) => {
                                        if (value === undefined) {
                                            value = 0
                                        }
                                        if (value != 0) {
                                            totalAdj++
                                        }
                                    });
                                    console.log(totalAdj)
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
                                                };
                                            }
                                            else {}
                                        });
                                        console.log('aweh9utghaeruhgy9iuoer')
                                        levelArray[layerChoice][layerComponentChoice][x].splice(y, 1, entranceDir); 
                                    }
                                }
                        };
                };
            }
            
        }
};

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
};


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

function ruler() {
    if (mouseTileChanged) {
        drawVisLevel()
        selEndX = mouseTileX;
        selEndY = mouseTileY;
        drawLine(selStartX * tileSize + panX, selStartY * tileSize + panY, selEndX * tileSize + panX, selEndY * tileSize + panY, 'brown', 8)
        let length = Math.round(Math.sqrt((selEndY - selStartY) ** 2 + (selEndX - selStartX) ** 2) * 10) / 10
        mainCtx.fillStyle = 'orange'
        mainCtx.font = '30px rodondo'
        mainCtx.fillText(length, (mouseTileX + 1.5) * tileSize + panX, (mouseTileY) * tileSize + panY)
    };
};

function box() {
    if (mouseTileChanged) {
        drawVisLevel()
        if (previewChoice) {
            preview();
        };
        switch (toolChoice) {
            case 1:
                color = 'red';
                width = 1;
            break
            case 4:
                color = 'teal';
                width = 3;
            break
            case 7:
                color = 'red';
                width = 5;
            break
        };
        mainCtx.strokeStyle = color;
        mainCtx.lineWidth = width;
        const selX = selStartX;
        const selY = selStartY;
        selEndX = mouseTileX;
        selEndY = mouseTileY;
        if (selEndX <= selStartX) {
            selStartX++;
        };
        if (selEndY <= selStartY) {
            selStartY++;
        };
        if (selEndX > selStartX) {
            selEndX++;
        };
        if (selEndY > selStartY) {
            selEndY++;
        };
        mainCtx.strokeRect((selStartX * tileSize) + panX - 0.5, (selStartY * tileSize) + panY - 0.5, (selEndX - selStartX) * tileSize, (selEndY - selStartY) * tileSize);
        selStartX = selX;
        selStartY = selY;
    }
}

function paint() {
    addValue(mouseTileX, mouseTileY)
    if (mouseTileChanged) {
            addValue(mouseTileX, mouseTileY);
    };
    drawVisValues(mouseTileX, mouseTileY);
};

function erase() {
    console.log('erasihgn')
    const prevTileChoice = tileChoice;
    tileChoice = 0;
    addValue(mouseTileX, mouseTileY)
    if (mouseTileChanged) {
            addValue(mouseTileX, mouseTileY);
    };
    tileChoice = prevTileChoice;
    drawVisValues(mouseTileX, mouseTileY);
}

function pan(event) {
    panX += event.movementX;
    panY += event.movementY;
    clearScreen();
    drawVisLevel();
}

function preview() {
    if (mouseTileChanged && previewChoice) {
        switch (tileChoice) {
            default:
                drawValue(tileChoice, mouseTileX, mouseTileY);
            break
            case 0:
                drawValue(22, mouseTileX, mouseTileY)
            break
            case 13:
                let x = mouseTileX;
                let y = mouseTileY;
                const adjArray = [levelArray[0][3][x][y - 1], levelArray[0][3][x][y + 1], levelArray[0][3][x - 1][y], levelArray[0][3][x + 1][y]];
                let totalAdj = 0;
                let entranceDir;
                adjArray.forEach((value) => {
                    if (value === undefined) {
                        value = 0
                    }
                    if (value != 0) {
                        totalAdj++
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
                            };
                        }
                        else {}
                    });
                    drawValue(entranceDir, x, y) 
                }
                else {
                    drawValue(entranceDir, x, y)
                }
            break
        }
        drawVisValues(prevMouseX, prevMouseY);
    }
}

initMainCanvas();

initLevelArray();

initAtlas();

drawVisLevel();

layerSelButtons.forEach(button => {                     //get the work layer choice any time a cork layer button is pressed
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
        };
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
                };
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
                };
        };
        drawVisLevel();
    });
});

tileButtons.forEach(button => {                         //get the tile choice any time a tile button is pressed
    button.addEventListener('click', () => {
        let tileName
        switch(button.id) {
            case 'wall':
                tileChoice = 1;
                layerComponentChoice = 1;
                tileName = 'wall';
            break
            case 'slope':
                switch(tileChoice) {
                    default:
                        tileChoice = slopeChoice;
                        tileName = 'bottom left slope';
                        layerComponentChoice = 1;
                    break
                    case 2:
                        slopeChoice++;
                        tileChoice++;
                        tileName = 'top left slope';
                        layerComponentChoice = 1;
                    break
                    case 3:
                        slopeChoice++;
                        tileChoice++;
                        tileName = 'top right slope';
                        layerComponentChoice = 1;
                    break
                    case 4:
                        slopeChoice = 2;
                        tileChoice++;
                        tileName = 'bottom right slope';
                        layerComponentChoice = 1;
                    break
                };
            break
            case 'batFly':
                tileChoice = 6;
                tileName = 'cool scug :0'
                layerComponentChoice = 1;
            break 
            case 'hPole':
                tileChoice = 7;
                tileName = 'horizontal pole'
                layerComponentChoice = 0;
            break
            case 'vPole':
                tileChoice = 8;
                tileName = 'vertical pole'
                layerComponentChoice = 0;
            break
            case 'crossPole':
                tileChoice = 9;
                tileName = 'cross pole'
                layerComponentChoice = 0;
            break
            case 'semisolidFloor':
                tileChoice = 10;
                tileName = 'Semisolid Platform'
                layerComponentChoice = 1;
            break
            case 'path':
                tileChoice = 12;
                tileName = 'shortcut path';
                layerComponentChoice = 3;
            break
            case 'entrance':
                tileChoice = 13;
                tileName = 'shortcut entrance';
                layerComponentChoice = 3;
            break
            case 'dragonDen':
                tileChoice = 14;
                tileName = 'creature den';
                layerComponentChoice = 3;
            break
            case 'whackamole':
                tileChoice = 15;
                tileName = 'creature shortcut';
                layerComponentChoice = 3;
            break
            case 'scavHole':
                tileChoice = 16;
                tileName = 'scavenger hole';
                layerComponentChoice = 3;
            break
            case 'garbageWorm':
                tileChoice = 17;
                tileName = 'garbage worm den';
                layerComponentChoice = 3;
            break
            case 'hive':
                tileChoice = 18;
                tileName = 'batfly hive';
                layerComponentChoice = 1;
            break
            case 'waterfall':
                tileChoice = 19;
                tileName = 'waterfall';
                layerComponentChoice = 2;
            break
            case 'wormGrass':
                tileChoice = 20;
                tileName = 'worm grass';
                layerComponentChoice = 1;
            break
            case 'roomExit':
                tileChoice = 21;
                tileName = 'room exit/entrance';
                layerComponentChoice = 3;
        };
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
                panX = -playStartX * baseTileSize;
                panY = -playStartY * baseTileSize;
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
                };
        
            };
        drawVisLevel();
    });
});

toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        let toolName
        switch (button.id) {
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
                previewChoice = false;
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
                toolName = 'erase all';
                previewChoice = false;
            break
        };
        toolIndicator.innerText = toolName;
        toolButtons.forEach(button => {
            button.setAttribute('selected', 'false');
        })
        button.setAttribute('selected', 'true');
    });
});

screen.addEventListener('mousemove', getGridPos);   //calculates a bunch of values based on current mouse position to use elsewhere

screen.addEventListener('mousemove', preview)		//draws the preview

screen.addEventListener('mouseleave', () => {		//draws the last mouse tile if the mouse leaves the canvas element
    if (previewChoice) {
        drawVisValues(mouseTileX, mouseTileY);
    }
})

screen.addEventListener('mousedown', (event) => {       //adds a mousemove event listener when the user clicks on the main canvas for the specified mouse button
    event.preventDefault();
    selStartX = mouseTileX;
    selStartY = mouseTileY;
    switch (event.button) {
        case 0:
            switch (toolChoice) {
                case 0:
                    paint();
                    screen.addEventListener('mousemove', paint);
                break
                case 8:
                    erase();
                    screen.addEventListener('mousemove', erase);
                break
                case 1:
                case 4:
                case 7:
                    screen.addEventListener('mousemove', box);
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
                        };
                    };
                break
                case 6:
                    screen.addEventListener('mousemove', ruler);
            };
        break
        case 1:
            screen.addEventListener('mousemove', pan);
        break
    };
});

document.addEventListener('mouseup', (event) => {            //removes the mousemove event listener when the user is done doing the thing
    screen.removeEventListener('mousemove', paint);
    screen.removeEventListener('mousemove', erase);
    screen.removeEventListener('mousemove', pan);
    screen.removeEventListener('mousemove', box);
    screen.removeEventListener('mousemove', ruler);
    screen.removeEventListener('mousemove', playEndEdit);
    screen.removeEventListener('mousemove', playStartEdit);
    if (event.button === 0) {
        if (selEndX <= selStartX) {
            selStartX++;
        };
        if (selEndY <= selStartY) {
            selStartY++;
        };
        switch (toolChoice) {
            case 1:
                if (visArray[layerChoice] === 1) {
					for (let x = Math.min(selStartX, selEndX); x < Math.max(selStartX, selEndX); x++) {
						for (let y = Math.min(selStartY, selEndY); y < Math.max(selStartY, selEndY); y++) {
							addValue(x, y);
						};
					};
				};
            break
            case 7:
                if (visArray[layerChoice] === 1) {
					levelArray[layerChoice].forEach(layerComponent => {
						for (let x = Math.min(selStartX, selEndX); x < Math.max(selStartX, selEndX); x++) {
							for (let y = Math.min(selStartY, selEndY); y < Math.max(selStartY, selEndY); y++) {
								layerComponent[x].splice(y, 1, 0);
							};
						};
					});
				};
            break  
        };
    };
    drawVisLevel();
});
