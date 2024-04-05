import {renderContext, level} from "../main.mjs";
import {Mode} from "./modes.mjs";
import {ButtonOptions} from "../ui.mjs";
//import {level} from "../main.mjs";

export class GeometryMode extends Mode {
	constructor() {
		super(true);

		this.toolSet = [
			"paint",
			"select",
			"bucket",
			"move view"
		];

		this.currentTool = "paint";

		this.tools = {};

		this.tileSet = [
			"air",
			"wall",
			"invisible wall",
			new ButtonOptions("slope", "oneSelectedCycle", {contents: "image", cycleOptions : ["slope BL", "slope TL", "slope TR", "slope BR"], textures : ["slope BL", "slope TL", "slope TR", "slope BR"]}),
			new ButtonOptions("pole", "oneSelectedCycle", {contents: "image", cycleOptions : ["pole V", "pole H"], textures : ["pole V", "pole H"]}),
			"cross pole",
			"semisolid platform",
			"batfly hive",
			"cool scug",
			new ButtonOptions("shortcut entrance", "oneSelected", {contents : "image", textures : ["U", "D", "L", "R"]}), 
			"shortcut path",
		  "room transition",
			"creature den",
			"creature shortcut",
			"scavenger den",
			"garbage worm den",
			"waterfall",
			"worm grass",
			"spear",
			"rock"
		];

		this.currentTile = "wall"
		this.modeSettings = [
			new ButtonOptions("automatic slopes", "toggle", {contents : "auto\nslopes"}),
		 	new ButtonOptions("test cycler", "cycle", {cycleOptions : [0, 1, 2, 3]}),
		  new ButtonOptions("test oneshot", "oneshot")
		];
		this.name = "geometry"
		this.autoSlope = false
		this.slopeChoice = "slope BL";
		this.poleChoice = "pole V";
		
		//tools for REAL
		this.tools.paint = {
			id : "paint",
			needsTileMovement: true,
			needsMouseMovement: false,
			needsPreview : true,
			previousAction: [],
			fn : (mouse) => {
				const pos = mouse.tile;
				if (this.layers.visibility[this.layers.workLayer] === true) {
					//this.tools.paint.previousAction.push(level.tileAt(pos));
					switch (this.currentTile) {
						default:
							level.setGeo(pos, this.currentTile);
						break
						case "slope":
							level.setGeo(pos, this.slopeChoice);
						break
						case "pole":
							level.setGeo(pos, this.poleChoice);
						break
					}
				}
			}
		}

		//capturing methods
		this.modeSettingsPress = (id, ...options) => {
			switch(id) {
				case "automatic slopes":
					this.autoSlope = options[0];
					console.log(this.autoSlope);
					renderContext.previewAlignToGrid = this.autoSlope;
				break
				
			}
		}

		this.tileButtonsPress = (id, option) => {
			this.currentTile = id;
			renderContext.previewTexture = id;
			if (id === "slope") {
				this.slopeChoice = option;
				renderContext.previewTexture = option;
			}

			if (id === "pole") {
				this.poleChoice = option;
				renderContext.previewTexture = option;
			}
		}

		this.capturedKeypresses = {
			" " : () => {									//spacebar
				console.log("spacebar")
				switch(this.currentTile) {
					default:
						//do nothing for the default
					break
					case "slope":
						if (this.slopeChoice !== "autoSlope") {
							switch(this.slopeChoice) {
								default:
									this.slopeChoice = "slope BL";
								break
								case "slope BL":
									this.slopeChoice = "slope TL";
								break
								case "slope TL":
									this.slopeChoice = "slope TR";
								break
								case "slope TR":
									this.slopeChoice = "slope BR";
								break
								case "slope BR":
									this.slopeChoice = "slope BL";
								break
							}
							renderContext.preview = this.slopeChoice;
						}
					break
					case "pole":
						switch(this.poleChoice) {
							default:
								this.poleChoice = "pole V";
							break
							case "pole V":
								this.poleChoice = "pole H";
							break
							case "pole H":
								this.poleChoice = "pole V";
							break
						}
						renderContext.preview = this.poleChoice;
					break
				}
			}
		}
	}	
}