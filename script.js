//say hi to my horrible code!!!
let tilesPerRow = 72;
let tilesPerColumn = 43;
let baseTileSize = 20;                                  //base size of each tile in pixels
let playSizeX = 48;                                     //width of the play area in tiles
let playSizeY = 35;                                     //height of the play area in tiles
let playStartX = 12;
let playStartY = 3;
let customScreenWidth = 60;
let customScreenHeight = 40;
const tileCount = 20;                                   //number of unique tiles for the atlas to store
let tilesPerLayer = tilesPerRow * tilesPerColumn;
const layerCount = 3;                                   //stores the number of layers to use
let zoomLevel = 1;                                      //stores the zoom level of the editor
let tileSize = baseTileSize;                            //the final tile size in pixels with zoom taken into account
let panX = -240;                                           //stores the x position in pixels that the user has moved the display to
let panY = -60;                                           //same, but for the y axis
let tileChoice = 1;                                     //stores the current tile choice
let toolChoice = 0;
let layerChoice = 0;                                    //stores the current work layer
let layerComponentChoice = 0;                           //stores which layer component to send a value to...
let showGrid = true;                                    
let selCornerX
let selCornerY
let selectionW
let selectionH

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
let visArray = new Array(layerCount).fill(1);                       //array that stores the layer visibility choices for each layer
const atlasCtx = atlasCanvas.getContext('2d');                      //canvas rendering context for the atlas's canvas

let mouseTileX = 0;                                              //stores the x value of the current grid cell that the mouse is over...
let mouseTileY = 0;                                              //same but for the y value
let prevMouseX = 0;                                          //stores the previous tileX that the mouse was over
let prevMouseY = 0;                                          //same but for y
let mouseTileChanged = false;                                        //true if the mouse tile changed since the last mousemove event, false if it didn't change
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

function initAtlas() {                              //initializes the atlas with the tileset in 'geoTiles/tiles.png'
    const atlasSrc = new Image();
    atlasSrc.src = 'geoTiles/tiles.png';
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
            playSizeX = width * 72 - 24;
            playSizeY = height * 43 - 8;
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

function handlePlaySizeChange(event) {
    event.preventDefault();
    const width = parseInt(document.getElementById('playTilesWide').value);
    const height = parseInt(document.getElementById('playTilesTall').value);
    const x = parseInt(document.getElementById('playStartX').value);
    const y = parseInt(document.getElementById('playStartY').value);
    const isXOOB = (width <= 0) || (width > (tilesPerRow - x));
    const isYOOB = (height <= 0) || (height > (tilesPerColumn - y));
    const areCoordsOOB = (x < 0) || (y < 0) || ((x + width) > tilesPerRow) || ((y + height) > tilesPerColumn);
    console.log(`${isXOOB} ${isYOOB} ${areCoordsOOB}`)
    switch (isXOOB || isYOOB || areCoordsOOB) {
        case false:
            playSizeX = width;
            playSizeY = height;
            playStartX = x;
            playStartY = y;
            drawVisLevel();
        break
        case true:
            alert('this would make the play area out of bounds!!!! dont do that!!!!!');
        break
        default:
        break
    };
};

function drawLevelOutline() {
    mainCtx.strokeStyle = 'rgb(127, 127, 255'
    mainCtx.lineWidth = 2
    mainCtx.strokeRect(panX, panY, tileSize * tilesPerRow, tileSize * tilesPerColumn)
};

function drawPlayAreaOutline() {
    mainCtx.strokeStyle = 'rgb(255, 127, 127)'
    mainCtx.lineWidth = 4
    mainCtx.strokeRect(playStartX * tileSize + panX, playStartY * tileSize + panY, playSizeX * tileSize, playSizeY * tileSize)
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
    mainCtx.beginPath();                                     //facing can be ul, dl, ur, dr (up-left, down-left, up-right, down-right)
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
            colorB = 'black';
            atlasMod = 0;
        break
        case 1:                                         //layer 1 draw mode
            colorA = 'rgba(255, 255, 255, 0)'
            colorB = 'rgb(150, 150, 150)'
            atlasMod = 0;
        break
        case 2:                                         //layer 2 draw mode
            colorA = 'rgba(255, 255, 255, 0)'
            colorB = 'rgb(200, 200, 200)'
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
            drawFromAtlas(3, x, y);
        break
        case 14:
            drawFromAtlas(5, x, y);
        break
        case 15:
            drawFromAtlas(8, x, y);
        break
        case 16:
            drawFromAtlas(4, x, y);
        break
        case 17:
            drawFromAtlas(7, x, y);
        break
        case 18:
            drawFromAtlas(1, x, y);
        break
        case 19:
            drawFromAtlas(2, x, y);
        break
        case 20:
            drawFromAtlas(0, x, y);
        break
        case 21:
            drawFromAtlas(10, x, y);
        break
        case 22:
            drawRect(colorA, x, y, tileSize)
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
                                case 0:
                                    levelArray[layerChoice].forEach((layerComponent) => {
                                        layerComponent[x].splice(y, 1, 0);
                                    })
                                }
                        };
                };
            }
            
        }
};

function boxFill() {
    mainCtx.strokeStyle = 'red'
    mainCtx.lineWidth = 1
    selectionW = mouseTileX - startCornerX
    selectionH = mouseTileY - startCornerY
    if (selectionW >= 0) {
        selectionW++
    }
    if (selectionH >= 0) {
        selectionH++
    }
    mainCtx.strokeRect((startCornerX * tileSize) + panX - 0.5, (startCornerY * tileSize) + panY - 0.5, selectionW * tileSize, selectionH * tileSize)
    console.log(`width ${selectionW} height ${selectionH}`)
};

function bucketFill(event) {

};

function playEdit(event) {

};

function paint() {
    addValue(mouseTileX, mouseTileY)
    switch(mouseTileChanged) {
        case true:
            addValue(mouseTileX, mouseTileY);
    };
    drawVisValues(mouseTileX, mouseTileY);
};

function pan(event) {
        panX += event.movementX;
        panY += event.movementY;
        clearScreen();
        drawVisLevel();
}

function zoom(event) {
    if (event.ctrlKey) {
        event.preventDefault()
        zoomLevel -= (event.deltaY / 100)
        if ((zoomLevel + baseTileSize) <= 5) {
            zoomLevel = -baseTileSize + 6
            console.log('ur zoom is too small :3!!!!')
        }
        tileSize = (zoomLevel + baseTileSize)
        drawVisLevel()
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
            case 'erase':
                tileChoice = 0;
                layerComponentChoice = 1;
                tileName = 'air';
            break
            case 'slope':
                switch(tileChoice) {
                    default:
                        tileChoice = 2;
                        tileName = 'slope';
                        layerComponentChoice = 1;
                    break
                    case 2:
                    case 3:
                    case 4:
                        tileChoice++;
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
        tileIndicator.innerText = `selected tile: ${tileName}`
        tileButtons.forEach(button => {
            button.setAttribute('selected', 'false');
        })
        button.setAttribute("selected", "true")
        console.log(`changed tile choice to ${tileChoice}`);
    });
});

toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        let toolName
        switch (button.id) {
            case 'paint':
                toolChoice = 0;
                toolName = 'Paint';
            break
            case 'boxFill':
                toolChoice = 1;
                toolName = 'Box fill';
            break
            case 'bucket':
                toolChoice = 2;
                toolName = 'bucket fill';
            break
            case 'playEdit':
                toolChoice = 3;
                toolName = 'play area editor';
            break
            case 'boxSelect':
                toolChoice = 4;
                toolName = 'box select';
            break
            case 'cameras':
                toolChoice = 5;
                toolName = 'CAmera editor';
            break
            case 'ruler':
                toolChoice = 6;
                toolName = 'ruler'
            break
            case 'eraseAll':
                toolChoice = 7;
                toolName = 'erase all layers'
        };
        toolIndicator.innerText = `selected tool: ${toolName}`;
        toolButtons.forEach(button => {
            button.setAttribute('selected', 'false');
        })
        button.setAttribute('selected', 'true');
    });
});

screen.addEventListener('mousemove', getGridPos);   //calculates a bunch of values based on current mouse position to use elsewhere

levelSizeForm.addEventListener('submit', handleLevelsizeChange)
playAreaSizeForm.addEventListener('submit', handlePlaySizeChange)

screen.addEventListener('mousemove', () => {         //draws the preview of the current tile at the mouse's position
    if (mouseTileChanged) {
        switch (tileChoice) {
            default:
                drawValue(tileChoice, mouseTileX, mouseTileY);
            break
            case 0:
                drawValue(22, mouseTileX, mouseTileY)
            break
        }
        drawVisValues(prevMouseX, prevMouseY);
    };
});

screen.addEventListener('mouseleave', () => {
    drawVisValues(mouseTileX, mouseTileY)
})

document.addEventListener('mouseup', () => {            //removes the mousemove event listener when the user is done doing the thing
    screen.removeEventListener('mousemove', paint);
    screen.removeEventListener('mousemove', pan);
    screen.removeEventListener('mousemove', boxFill);
    screen.removeEventListener('mousemove', playEdit);
    switch (toolChoice) {
        case 1:
            
            console.log(`width ${selectionW} height ${selectionH}`)
        break
    }
    selectionW = 0;
    selectionH = 0;
    selCornerX = 0;
    selCornerY = 0;
    drawVisLevel()
});

screen.addEventListener('wheel', zoom);                 //this is the event listener handling zoom

editorSettings.forEach(button => {
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
                        showGrid = true
                        button.innerText = 'hide grid'
                        console.log('turned grid on')
                    break
                    case true:
                        showGrid = false
                        button.innerText = 'show grid'
                        console.log('turned grid off')
                }
        
            };
        drawVisLevel();
    });
});

screen.addEventListener('mousedown', (event) => {       //adds a mousemove event listener when the user clicks on the main canvas for the specified mouse button
    event.preventDefault();
    startCornerX = mouseTileX
    startCornerY = mouseTileY
    switch (event.buttons) {
        case 1:
            switch (toolChoice) {
                case 0:
                    paint();
                    screen.addEventListener('mousemove', paint);
                break
                case 1:
                    screen.addEventListener('mousemove', boxFill);
                break
                case 2:
                    bucketFill(event);
                break
                case 3:
                    screen.addEventListener('mousemove', playEdit)
            }
        break
        case 4:
            screen.addEventListener('mousemove', pan);
        break
    };
});
