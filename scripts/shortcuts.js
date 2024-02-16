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
	if (selArray.length > 0) {
		if (toolChoice != 'boxSelect') {
			changeTool('boxSelect');
		}
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
}

function redo() {
	console.log(currentOperation, undoArray.length)
	if (currentOperation < undoArray.length) {
		undoArray[currentOperation].forEach((tile) => {
			levelSave.levelArray[tile.layer][tile.component][tile.x].splice(tile.y, 1, tile.newType);
			drawVisValues(tile.x, tile.y);
		});
		currentOperation++
	}
}

function undo() {
	console.log(currentOperation, undoArray.length)
	if (currentOperation > 0) {
		undoArray[currentOperation - 1].forEach((tile) => {
			levelSave.levelArray[tile.layer][tile.component][tile.x].splice(tile.y, 1, tile.oldType);
			drawVisValues(tile.x, tile.y);
		});
		currentOperation--
	}
}

function zoom(event) {
	if (event.ctrlKey) {
		event.preventDefault();
		zoomLevel -= (event.deltaY / 100)
		if ((zoomLevel + baseTileSize) <= 0) {
			zoomLevel = -baseTileSize + 1;
			console.log('ur zoom is too small :3!!!!');
		}
		tileSize = (zoomLevel + baseTileSize);
		drawVisLevel();
	}
}

screen.addEventListener('wheel', zoom);

document.addEventListener('keydown', (event) => {
	if (event.key === ' ') {
		if (!editorSave.autoSlope) {
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
	} else if (event.key === 'm') {
		screen.addEventListener('mousemove', pan);
	}
	if (event.ctrlKey) {
		switch (event.key) {
			case 's':
				event.preventDefault();
				saveLevelSettings();
			break
			case 'l':
				event.preventDefault();
				loadLevelSettings();
			break
			case 'z':
				event.preventDefault();
				undo();
			break
			case 'y':
				event.preventDefault();
				redo();
			break
			case 'v':
				event.preventDefault();
				paste();
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
				case 'x':
					event.preventDefault();
					cut();
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

document.addEventListener('keyup', (event) => {
	if (event.key === 'm') {
		screen.removeEventListener('mousemove', pan);
	}
})