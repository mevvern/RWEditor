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

function placeSelection() {
	
}

function copy(event) {
	event.preventDefault();
	clipBoard = selArray;
	console.log('copied the selection');
}

function cut(event) {
	event.preventDefault();
	clipBoard = selArray;
	selArray = 'cutter';
	selStartX = 0;
	selStartY = 0;
	selEndX = 0;
	selEndY = 0;
	drawSel = false;
	selBox = false;
	console.log('cut the selection');
	drawVisLevel();
}

function del(event) {
	event.preventDefault();
	selArray = 'really sad tbh';
	selStartX = 0;
	selStartY = 0;
	selEndX = 0;
	selEndY = 0;
	drawSel = false;
	selBox = false;
	console.log('deleted the selection!!!!! :3');
	drawVisLevel();
}

function paste(event) {
	event.preventDefault();
	selArray = clipBoard;
	selStartX = 0;
	selStartY = 0;
	selEndX = clipBoard[0].length;
	selEndY = clipBoard[0][0].length;
	drawSel = true;
	console.log('pasted the selection');
	drawVisLevel();
}

function save(event) {
	event.preventDefault();
	if (levelName === 'New Level') {
		alert('please name your level something other than New Level')
	} else {
		if (confirm('Do you really want to save the level?\nThis will delete the previously saved level...')) {
			localStorage.setItem('levelArray', JSON.stringify(levelArray));
			localStorage.setItem('tilesPerRow', tilesPerRow);
			localStorage.setItem('tilesPerColumn', tilesPerColumn);
			localStorage.setItem('playStartX', playStartX);
			localStorage.setItem('playStartY', playStartY);
			localStorage.setItem('playEndX', playEndX);
			localStorage.setItem('playEndY', playEndY);
			localStorage.setItem('screensWide', screensWide);
			localStorage.setItem('screensTall', screensTall);
			localStorage.setItem('levelName', levelName);
			console.log('saved the level');
		}
	}
}

function load(event) {
	event.preventDefault();
	if (localStorage.getItem('levelArray') === null) {
		alert('cannot load a nonexistent level!!!!')
	}
	else {
		levelArray = JSON.parse(localStorage.getItem('levelArray'))
		tilesPerRow = parseInt(localStorage.getItem('tilesPerRow'))
		tilesPerColumn = parseInt(localStorage.getItem('tilesPerColumn'));
		playStartX = parseInt(localStorage.getItem('playStartX'));
		playStartY = parseInt(localStorage.getItem('playStartY'));
		playEndX = parseInt(localStorage.getItem('playEndX'));
		playEndY = parseInt(localStorage.getItem('playEndY'));
		screensWide = parseInt(localStorage.getItem('screensWide'));
		screensTall = parseInt(localStorage.getItem('screensTall'));
		levelName = localStorage.getItem('levelName');
		levelNameField.setAttribute('value', levelName);
		pageTitle.innerText = levelName;
		widthField.setAttribute('value', screensWide)
		heightField.setAttribute('value', screensTall)
		drawVisLevel()
		console.log('loaded the level :3')
	} 
}

function undo(event) {
	event.preventDefault();
	console.log('undid the previous action');
}

function zoom(event) {
	if (event.ctrlKey) {
		event.preventDefault()
		zoomLevel -= (event.deltaY / 100)
		if ((zoomLevel + baseTileSize) <= 0) {
			zoomLevel = -baseTileSize + 1
			console.log('ur zoom is too small :3!!!!')
		}
		tileSize = (zoomLevel + baseTileSize)
		drawVisLevel()
	}
}

screen.addEventListener('wheel', zoom);

document.addEventListener('keydown', (event) => {
	if (toolChoice === 4 && event.key === 'Delete') {
		del(event);
	}
	if (event.key === 'Enter') {
		placeSelection();
	}
	if (event.ctrlKey) {
		switch (event.key) {
			case 'c':
				copy(event);
			break
			case 'v':
				paste(event);
			break
			case 'x':
				cut(event);
			break
			case 'z':
				undo(event);
			break
			case 's':
				save(event);
			break
			case 'l':
				load(event);
			break
		}
	}
});