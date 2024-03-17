class TileMap {
	constructor() {
		this.#convertToMap();
		
		this.convertName = (name, resultChoice) => {
			switch (resultChoice) {
				default:
					throw new Error("resultChoice must be oldId or newId");
				break
				case "oldId":
					const obj = {};
					const index = this.#names.indexOf(name);

					obj.id = this.#oldNonStackIds[index];
					obj.stackChoice = 0;

					if (this.#oldNonStackIds[index] === null && typeof this.#oldStackableIds[index] === "number") {
						obj.id = this.#oldStackableIds[index];
						obj.stackChoice = 1;
					} else {
						throw new Error("the tileName \"" + name + "\" doesn't exist for the old editor!")
					}

					return obj;
				break
				case "newId":
					return this.#newIds[this.#names.indexOf(name)]
				break

			}
		}

		this.convertNewId = (newId, resultChoice) => {
			switch (resultChoice) {
				default:
					throw new Error("resultChoice must be oldId or newId");
				break
				case "oldId":
					const obj = {};
					const index = this.#newIds.indexOf(newId);

					obj.id = this.#oldNonStackIds[index];
					obj.stackChoice = 0;

					if (this.#oldNonStackIds[index] === null && typeof this.#oldStackableIds[index] === "number") {
						obj.id = this.#oldStackableIds[index];
						obj.stackChoice = 1;
					} else {
						throw new Error("the id \"" + newId + "\" doesn't exist for the old editor!")
					}

					return obj;
				break
				case "name":
					return this.#names[this.#newIds.indexOf(newId)]
				break
		}
		}

		this.convertOldId = (oldId, stackChoice, resultChoice) => {
			if (stackChoice === 1) {
				return this.#newIds[this.#oldStackableIds.indexOf(oldId)];
			} else if (stackChoice === 0) {
				return this.#newIds[this.#oldNonStackIds.indexOf(oldId)];
			} else {
				throw new Error("must provide a stackable choide of 0 or 1");
			}
		}

		this.export = (newId) => {
			let index = this.#newIds.indexOf(newId);
			let exportObj = {};
			exportObj.choice = this.#stackChoices[index];
			if (exportObj.choice === 1) {
				exportObj.id = this.#oldStackableIds[index];
			} else {
				exportObj.id = this.#oldNonStackIds[index];
			}
			return exportObj;
		}
	}

	#names = [];
	#newIds = [];
	#oldNonStackIds = [];
	#oldStackableIds = [];
	#stackChoices = [];

	#convertToMap = () => {
		tileLookup.forEach(map => {
			this.#newIds.push(map[0]);
			this.#names.push(map[3]);
			this.#stackChoices.push(map[1]);
			if (map[1] === 0) {
				this.#oldNonStackIds.push(map[2]);
				this.#oldStackableIds.push(null);
			} else {
				this.#oldNonStackIds.push(null);
				this.#oldStackableIds.push(map[2]);
			}
		})
		//console.log(this.#names, this.#newIds, this.#oldNonStackIds, this.#oldStackableIds);
	}
}

const tileLookup = [
	// structure: [newTileId, stackChoice, oldTileId, tileName]
	[0, 0, 0, "air"],
	[1, 0, 1, "wall"],
	[2, 0, 2, "slope DL"],
	[3, 0, 4, "slope UL"],
	[4, 0, 5, "slope UR"],
	[5, 0, 3, "slope DR"],
	[6, 0, 0, "cool scug"],
	[10, 0, 6, "semisolid platform"],
	[29, 0, 9, "invisible wall"],
	[7, 1, 1, "pole H"],
	[8, 1, 2, "pole V"],
	[9, 1, null, "cross pole"],
	[12, 1, 5, "shortcut path"],
	[13, 1, 4, "shortcut entrance"],
	[14, 1, 7, "creature den"],
	[15, 1, 19, "creature shortcut"],
	[16, 1, 12, "scavenger den"],
	[17, 1, 13, "garbage worm den"],
	[18, 1, 3, "batfly hive"],
	[19, 1, 18, "waterfall"],
	[20, 1, 20, "worm grass"],
	[21, 1, 6, "room transition"],
	[27, 1, 10, "spear"],
	[28, 1, 9, "rock"],
	[30, 1, 12, "forbid batfly chains"]
]

export const tileMap = new TileMap();