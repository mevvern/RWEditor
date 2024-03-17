export class Mode {
	constructor(layersUsed) {
		this.toolSet = [];
		this.currentTool = null;
		this.tileSet = [];
		this.currentTile = null;
		this.currentSelection = null;
		this.modeSettings = []
		this.name = null;
		this.capturedKeypresses = {};
		this.modeSettingsPress = null;
		this.layers = {};

		if (layersUsed === true) {
			this.layers.layersUsed = true;
			this.layers.workLayer = 0;
			this.layers.visibility = [true, true, true];
		} else {
			this.layers.layersUsed = false;
			this.layers.workLayer = null;
			this.layers.visibility = null;
		}
	}
}

export class ModeSetting {
	/**
	@param {string} id - the id for the mode setting
	@param {string} type - the type of button which the setting should be 
	@param {Array} cycleOptions - the list of options which the cycler should cycle through
*/
	constructor(id, type, cycleOptions) {
		this.id = id;
		switch (type) {
			default:
				this.type = "toggle";
			break
			case "toggle":
				this.type = "toggle";
			break
			case "cycle":
				if (cycleOptions.length < 2 || !(cycleOptions instanceof Array)) {
					throw new Error("must provide at least two options in an array to cycle through")
				} 
				this.type = "cycle";
				this.cycleOptions = cycleOptions;
			break
			case "oneshot":
				this.type = "oneshot";
			break
		}
	}
}
