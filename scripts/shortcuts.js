function copy() {
	levelSave.clipBoard = selArray;
	console.log('copied the selection');
}

function cut() {
	levelSave.clipBoard = selArray;
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

function del() {
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

function paste() {
	if (drawSel) {
		placeSelection();
	}
	selArray = levelSave.clipBoard;
	selStartX = 0;
	selStartY = 0;
	selEndX = levelSave.clipBoard[0].length;
	selEndY = levelSave.clipBoard[0][0].length;
	drawSel = true;
	selBox = true;
	console.log('pasted the selection');
	drawVisLevel();
}

function saveLevelSettings() {
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

function loadLevelSettings() {
	if (localStorage.getItem('levelArray') === null) {
		alert('cannot load a nonexistent level!!!!')
	} else {
		if (confirm('Do you really want to load the saved level?\nThis will delete the current level')) {
			levelArray = JSON.parse(localStorage.getItem('levelArray'));
			tilesPerRow = parseInt(localStorage.getItem('tilesPerRow'));
			tilesPerColumn = parseInt(localStorage.getItem('tilesPerColumn'));
			playStartX = parseInt(localStorage.getItem('playStartX'));
			playStartY = parseInt(localStorage.getItem('playStartY'));
			playEndX = parseInt(localStorage.getItem('playEndX'));
			playEndY = parseInt(localStorage.getItem('playEndY'));
			screensWide = parseInt(localStorage.getItem('screensWide'));
			screensTall = parseInt(localStorage.getItem('screensTall'));
			levelName = localStorage.getItem('levelName');
			handleNameChange(levelName);
			widthField.setAttribute('value', screensWide);
			heightField.setAttribute('value', screensTall);
			drawVisLevel();
			console.log('loaded the level :3');
		}
	} 
}

function undo() {
	console.log('undid the previous action');
}

function zoom(event) {
	if (event.ctrlKey) {
		event.preventDefault();
		editorSave.zoomLevel -= (event.deltaY / 100);
		if ((editorSave.zoomLevel + baseTileSize) <= 0) {
			editorSave.zoomLevel = -baseTileSize + 1;
			console.log('ur zoom is too small :3!!!!');
		}
		tileSize = (editorSave.zoomLevel + baseTileSize);
		saveEditorSettings();
		drawVisLevel();
	}
}

screen.addEventListener('wheel', zoom);

document.addEventListener('keydown', (event) => {
	if (event.key === ' ') {
		if (! autoSlope) {
			switch (tileChoice) {				//manual slope
				case 2:
				case 3:
				case 4:
					event.preventDefault();
					tileChoice++;
					slopeChoice++;
					tileIndicator.innerText = tileMap.numericalIdToName(tileChoice);
				break
				case 5:
					event.preventDefault();
					tileChoice = 2;
					slopeChoice = 2;
					tileIndicator.innerText = tileMap.numericalIdToName(tileChoice);
			}
		}
		switch (tileChoice) {
			case 7:
				event.preventDefault();
				tileChoice = 8;
			break
			case 8:
				event.preventDefault();
				tileChoice = 7;
		}
		preview();
	}
	if (event.ctrlKey) {
		switch (event.key) {
			case 's':
				event.preventDefault();
				newsaveLevelSettings();
			break
			case 'l':
				event.preventDefault();
				newloadLevelSettings();
			break
		}
	}
	if (toolChoice === 'boxSelect') {
		if (event.ctrlKey) {
			switch (event.key) {
				case 'c':
					event.preventDefault();
					copy();
				break
				case 'v':
					event.preventDefault();
					paste();
				break
				case 'x':
					event.preventDefault();
					cut();
				break
				case 'z':
					event.preventDefault();
					undo();
				break
			}
		} else {
			switch (event.key) {
				case 'Delete':
					event.preventDefault();
					del();
				break
				case 'Enter':
					event.preventDefault();
					placeSelection();
					del();
				break
			}
		}
	}
});