function copy(event) {
	event.preventDefault();
	console.log('copied the selection');
};

function cut(event) {
	event.preventDefault();
	console.log('cut the selection');
};

function paste(event) {
	event.preventDefault();
	console.log('pasted the selection');
};

function save(event) {
	if (event.ctrlKey && event.key === 's') {
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
	}
};

function load(event) {
	if (event.ctrlKey && event.key === 'l') {
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
}

function del(event) {
	if (event.key === 'Delete') {
		event.preventDefault();
		console.log('deleted the selection!!!!! :3');
	}
}

function undo(event) {
	if (event.ctrlKey && event.key === 'z') {
		event.preventDefault();
		console.log('undid the previous action');
	}
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
document.addEventListener('copy', copy);
document.addEventListener('paste', paste);
document.addEventListener('cut', cut);
document.addEventListener('keydown', save);
document.addEventListener('keydown', undo);
document.addEventListener('keydown', del);
document.addEventListener('keydown', load);