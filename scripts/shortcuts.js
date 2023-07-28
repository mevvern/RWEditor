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
		localStorage.setItem('levelArray', JSON.stringify(levelArray))
		console.log('saved the level');
	}
};

function load(event) {
	if (event.ctrlKey && event.key === 'l') {
		levelArray = JSON.parse(localStorage.getItem('levelArray'))
		console.log('loaded the level :3')
		drawVisLevel()
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