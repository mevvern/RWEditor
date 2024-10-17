import {Mode} from "./modes.mjs";
import {ButtonOptions} from "../ui.mjs";
import {editor, level, renderContext} from "../main.mjs";
import {PlaceHolderMaterial} from "../MaterialAssetParsing.mjs";
import { Tile } from "../level.mjs";

export class MaterialsMode extends Mode {
	constructor() {
		super(true);
		this.toolSet = ["paint", "select", "bucket", "move view"];
		this.currentTool = "paint";
		this.tools = {};
		this.tileSet = [];
		this.currentTile = "bricks"
		this.modeSettings = [
			new ButtonOptions("brush size", "cycle", {cycleOptions : [1, 2, 3, 4, 5]}),
			new ButtonOptions("material option", "cycle", {cycleOptions : ["random", 0, 1, 2, 3]}),
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
				const geometry = editor.modes.geometry;

				if (geometry.layers.visibility[geometry.layers.workLayer] === true) {
					//this.tools.paint.previousAction.push(level.tileAt(pos));
					const tile = new Tile();
					switch (geometry.currentTile) {
						default:
							tile.material = this.currentTile;
							tile.tileType = editor.modes.geometry.currentTile;
							tile.pos = pos;

							level.setTile(tile);
						break
						case "slope":
							tile.material = this.currentTile;
							tile.tileType = editor.modes.geometry.slopeChoice;
							tile.pos = pos;

							level.setTile(tile);
						break
						case "pole":
							tile.material = this.currentTile;
							tile.tileType = editor.modes.geometry.poleChoice;
							tile.pos = pos;

							level.setTile(tile);
						break
					}
				}
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

		this.tileButtonPress = (id, option) => {
			if (renderContext.materials[id] instanceof PlaceHolderMaterial) {
				console.log("%cthat material's not ready yet!!!", "color : red");
				return
			}
			this.currentTile = id;
			renderContext.previewMaterial = id;
		}

		this.capturedKeypresses = {
			
		}
	}	
}