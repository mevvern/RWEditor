function addToClipboard() {
	w = Math.abs(selStartX - selEndX);
	h = Math.abs(selStartY - selEndY);
	layer = levelArray[layerChoice];
	minX = Math.min(selStartX, selEndX);
	minY = Math.min(selStartY, selEndY);
	selArray = new Array(4);
	selArray.forEach((value, index) => {
		for (let i = 0; i < w; i++) {
			selArray[index].splice(i, 1, new Array(h));
		}
		for (let x = minX; x < Math.max(selStartX, selEndX); x++) {
			for (let y = minY; y < Math.max(selStartY, selEndY); y++) {
				selArray[index][x - minX].splice(y - minY, 1, layer[index][x][y]);
			};
		};
	})
};

function pasteSelection() {

}

function deleteSelection() {

}

function copy(event) {
	event.preventDefault();
	addToClipboard();
	selBox = true;
	console.log('copied the selection');
};

function cut(event) {
	event.preventDefault();
	addToClipboard();
	deleteSelection();
	selBox = false;
	console.log('cut the selection');
};

function del(event) {
	event.preventDefault();
	deleteSelection();
	selBox = true;
	console.log('deleted the selection!!!!! :3');
}

function paste(event) {
	event.preventDefault();
	pasteSelection();
	selBox = true;
	console.log('pasted the selection');
};

function save(event) {
	event.preventDefault();
	if (confirm('Do you really want to save the level?\nThis will delete the previously saved level...')) {
		localStorage.setItem('levelArray', JSON.stringify(levelArray));
		localStorage.setItem('tilesPerRow', tilesPerRow);
		localStorage.setItem('tilesPerColumn', tilesPerColumn);
		localStorage.setItem('playStartX', playStartX);
		localStorage.setItem('playStartY', playStartY);
		localStorage.setItem('playEndX', playEndX);
		localStorage.setItem('playEndY', playEndY);
		console.log('saved the level');
	}
};

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
		drawVisLevel()
		console.log('loaded the level :3')
	} 
}

function undo(event) {
	event.preventDefault();
	console.log('undid the previous action');
};

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

screen.addEventListener('wheel', zoom);
document.addEventListener('keydown', (event) => {
	if (toolChoice === 4 && event.key === 'Delete') {
		deleteSelection();
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