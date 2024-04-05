import {Mode} from "./modes.mjs";
import {ButtonOptions} from "../ui.mjs";

export class MaterialsMode extends Mode {
	constructor() {
		super(true);
		this.toolSet = ["paint", "select", "bucket", "move view"];
		this.currentTool = "move view";
		this.tools = {};
		this.tileSet = [];
		this.currentTile = "standard"
		this.modeSettings = [
			new ButtonOptions("brush size", "cycle", {cycleOptions : [1, 2, 3, 4, 5]}),
			new ButtonOptions("cause a ruckus", "oneshot", "cause a ruckus")
		];
		this.name = "texture"
		
		//tools for REAL
		this.tools.paint = {
			id : "paint",
			needsTileMovement: true,
			needsMouseMovement: false,
			needsPreview : true,
			previousAction: [],
			fn : (mouse) => {
				const pos = mouse.tile;
				console.log(pos)
			}
		}

		//capturing methods
		this.modeSettingsPress = (id, ...options) => {
			switch(id) {
				case "brush size":
					this.brushSize = parseInt(options[0])
					console.log(this.brushSize);
				break
			}
		}

		this.capturedKeypresses = {
			
		}
	}	
}