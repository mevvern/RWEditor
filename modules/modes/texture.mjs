import {Mode} from "./modes.mjs";
import {ModeSetting} from "./modes.mjs";

export class TextureMode extends Mode {
	constructor() {
		super(true);
		this.toolSet = ["paint", "select", "bucket", "move view"];
		this.currentTool = "move view";
		this.tools = {};
		this.tileSet = ["a lot dw abt it", "a", "b", "c", "d"],
		this.currentTile = null
		this.modeSettings = [new ModeSetting("brush size", "cycler", 1, 2, 3, 4, 5), new ModeSetting("cause a ruckus", "oneshot")];
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