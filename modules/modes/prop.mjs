import {Mode} from "./modes.mjs";
import {ButtonOptions} from "../ui.mjs";
import {renderContext} from "../main.mjs";

export class PropMode extends Mode {
	constructor() {
		super(true);
		this.toolSet = ["select", "move view", "paint"];
		this.currentTool = "move view";
		this.tools = {};
		this.tileSet = ["ass", "load", "of", "props"],
		this.currentTile = "ass"
		this.modeSettings = [
			new ButtonOptions("prop alignment", "cycle", {cycleOptions : ["none", "coarse", "fine"]})
		];
		this.name = "prop"
		this.propAlignment = "coarse"
		
		//tools for REAL
		this.tools.select = {
			id : "select",
			needsTileMovement: true,
			needsMouseMovement: false,
			needsPreview : true,
			previousAction: [],
			fn : (mouse) => {
				
			}
		}

		//capturing methods
		this.modeSettingsPress = (id, ...options) => {
			switch(id) {
				case "prop alignment":
					renderContext.previewAlignToGrid = options[0];
				break
			}
		}

		this.capturedKeypresses = {
			
		}
	}	
}