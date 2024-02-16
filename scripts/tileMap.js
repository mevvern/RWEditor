const tileMapArray = [
// structure: [newTileId, stackChoice, oldTileId, tileName]
	[0, 0, 0, "air"],
	[1, 0, 1, "wall"],
	[2, 0, 2, "down-left slope"],
	[3, 0, 4, "up-left slope"],
	[4, 0, 5, "up-right slope"],
	[5, 0, 3, "down-right slope"],
	[6, 0, 0, "cool scug 0:"],
	[10, 0, 6, "semisolid platform"],
	[29, 0, 9, "invisible wall"],
	[7, 1, 1, "horizontal pole"],
	[8, 1, 2, "vertical pole"],
	[9, 1, "cross pole", "cross pole"],
	[12, 1, 5, "shortcut path"],
	[13, 1, 4, "shortcut entrance"],
	[14, 1, 7, "creature den"],
	[15, 1, 19, "creature shortcut"],
	[16, 1, 12, "scavenger hole"],
	[17, 1, 13, "garbage worm den"],
	[18, 1, 3, "batfly hive"],
	[19, 1, 18, "waterfall"],
	[20, 1, 20, "worm grass"],
	[21, 1, 6, "room transition"],
	[27, 1, 10, "spear"],
	[28, 1, 9, "rock"],
	[30, 1, 12, "forbid batfly chains"]
];

const tileNameArray = new Array();

const newTileIdArray = new Array();

const oldTileIdArray = new Array();

const tileStackableChoiceArray = new Array();

tileMapArray.forEach((tile, tileIndex) => {
	tileNameArray.push(tile[3]);
	newTileIdArray.push(tile[0]);
	oldTileIdArray.push(tile[2]);
	tileStackableChoiceArray.push(tile[1]);
})

const tileMap = {
	import : (value, stackableChoice) => {
		if (stackableChoice === undefined) {
			throw new Error('you must choose a stackable choice!')
		}
		let importValue;
		if (stackableChoice === 0) {
			importValue = newTileIdArray[oldTileIdArray.indexOf(value)];
		} else {
			importValue = newTileIdArray[oldTileIdArray.indexOf(value, tileStackableChoiceArray.indexOf(1))];
		}
		return importValue;
	},
	export : (value) => {
		const exportValue = new Array();
		let index = newTileIdArray.indexOf(value)
		exportValue.push(oldTileIdArray[index]);
		exportValue.push(tileStackableChoiceArray[index])
		return exportValue;
	},
	nameToNumericalId : (name) => {
		let id;
		id = newTileIdArray[tileNameArray.indexOf(name)];
		return id;
	},
	numericalIdToName : (id) => {
		let name;
		name = tileNameArray[newTileIdArray.indexOf(id)];
		return name;
	}
}