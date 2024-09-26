import {vec2, vec3, vec4, Area} from "./utils.mjs";
import {level, renderContext} from "./main.mjs";
import {ButtonOptions, ui} from "./ui.mjs";

import {GeometryMode} from "./modes/geometry.mjs";
import {MaterialsMode} from "./modes/materials.mjs";
import {PropMode} from "./modes/prop.mjs";
import {Mode} from "./modes/modes.mjs";

export class Editor {
	constructor() {
		this.mouse = {
			tile: new vec3(),
			prevTile: new vec3(),
			levelRelative: new vec3(),
			pos: new vec3(),
			insideBounds : {
				x : false,
				y : false
			},
			insideLevel: false,
			movement: new vec2(),
			leftPressed: false,
			rightPressed: false,
			middlePressed: false,
			sendMovementToTool: false,
		}

		this.modes = new ModeSet();

		//event handler methods-----------------------------------------------------------------------

		//mouse events------------------------------------------------------		
		
		this.scroll = (event) => {
			renderContext.viewSize -= event.deltaY / 100;
		}

		this.mouseMove = (event) => {
			const mouse = this.mouse;

			mouse.pos.x = event.clientX;
			mouse.pos.y = event.clientY;
			mouse.pos.z = this.currentMode.layers.workLayer;

			mouse.movement.x = event.movementX;
			mouse.movement.y = event.movementY;

			renderContext.mouseScreenPos = mouse.pos;

			if ((mouse.tile.x !== mouse.prevTile.x) || (mouse.tile.y !== mouse.prevTile.y)) {
				mouse.prevTile = mouse.tile.dupe();
				
				if (mouse.tile.y < 0 || mouse.tile.y > level.size.y - 1) {
					mouse.insideBounds.y = false;
				} else {
					mouse.insideBounds.y = true;
				}
	
				if (mouse.tile.x < 0 || mouse.tile.x > level.size.x - 1) {
					mouse.insideBounds.x = false;
				} else {
					mouse.insideBounds.x = true;
				}

				if (this.currentTool.needsTileMovement && mouse.leftPressed) {
					this.currentTool.fn(mouse);
				}
			}

			if (mouse.middlePressed || (this.currentMode.currentTool === "move view" && mouse.leftPressed)) {
				const newViewPos = new vec2();
				newViewPos.x = renderContext.viewPos.x + mouse.movement.x;
				newViewPos.y = renderContext.viewPos.y + mouse.movement.y;
				renderContext.viewPos = newViewPos;
			} else if (this.currentTool.needsMouseMovement && mouse.leftPressed) {
				this.currentTool.fn(mouse);
			}
		}

		this.mouseEvent = {
			left: {
				down: () => {
					this.mouse.leftPressed = true;
					this.currentTool.fn(this.mouse);
				},

				up: () => {
					this.mouse.leftPressed = false;
					//level.history.push(structuredClone(this.currentTool.previousAction));
					this.currentTool.previousAction = [];
				}
			},
			
			right: {
				down: () => {
					this.mouse.rightPressed = true;
				},

				up: () => {
					this.mouse.rightPressed = false;
				}
			},

			middle: {
				down: () => {
					this.mouse.middlePressed = true;
				},

				up: () => {
					this.mouse.middlePressed = false;
				}
			}
		}

		//button events-=-=================-==-=--=-=-=-=-=-=-=-

		this.tileButtonsPress = (id, option) => {
			if ("tileButtonPress" in this.currentMode) {
				this.currentMode.tileButtonPress(id, option);
				console.log("tilebuttonpress captured by current mode");
			} else {
				this.currentMode.currentTile = id;
				renderContext.previewTile = id;
				console.log(this.currentMode.name + "'s tile pressed: " + id + " option: " + option);
			}
		}

				//---------------------------------//
		this.toolButtonsPress = (id) => {
			if ("toolButtonPress" in this.currentMode) {
				this.currentMode.toolButtonPress(id);
				console.log("toolbuttonpress captured by current mode");
			} else {
				this.currentMode.currentTool = id;
				renderContext.previewVis = this.currentTool.needsPreview;
				console.log(this.currentMode.name + "'s tool set to: " + id + " option: " + option);
			}
		}

				//---------------------------------//
		this.layerVisPress = (layerNumber) => {
			if (this.currentMode.layers.layersUsed === true) {
				if (this.currentMode.layers.visibility[layerNumber] === true) {
					this.currentMode.layers.visibility[layerNumber] = false;
					console.log("vis" + layerNumber + " false")
				} else {
					this.currentMode.layers.visibility[layerNumber] = true;
					console.log("vis" + layerNumber + " true")
				}
				renderContext.layerVis = this.currentMode.layers.visibility;
			}
		}

				//---------------------------------//
		this.layerChoicePress = (layerNumber) => {
			if (this.currentMode.layers.layersUsed === true) {
				this.currentMode.layers.workLayer = parseInt(layerNumber);
				this.mouse.tile.z = parseInt(layerNumber);

				renderContext.previewDepth = this.mouse.tile.z;

				console.log("work layer set to: " + this.currentMode.layers.workLayer);
			}
		}

				//---------------------------------//
		this.modeButtonsPress = async (id) => {
			this.currentMode = id;
			console.log("mode switched to: " + id + ", tool: " + this.currentMode.currentTool + ", tile: " + this.currentMode.currentTile);

			renderContext.previewAlignToGrid = "coarse";
			renderContext.previewVisible = this.currentMode.needsPreview;

			ui.clearUi();
			ui.showLayers(false);

			if (!this.currentMode.tileSet[0] && id === "materials") {
				const json = await fetch("./resources/render/materials/materials.json").catch(()=> {
					console.log("tileset for mode \"" + id + "\" didn't exist");
				});

				const materials = await json.json();

				this.currentMode.materials = materials;
				this.currentMode.tileSet = Object.keys(materials);
			}

			if (this.currentMode.tileSet[0]) {
				ui.generateButtonSet(this.currentMode.tileSet, "tileButtons", this.currentMode.currentTile);
			}

			if (this.currentMode.toolSet[0]) {
				ui.generateButtonSet(this.currentMode.toolSet, "toolButtons", this.currentMode.currentTool);
			}

			if (this.currentMode.modeSettings[0]) {
				const modeButtons = this.#defaultModeButtons.concat(this.currentMode.modeSettings);
				ui.generateButtonSet(modeButtons, "modeSettings");
				this.currentMode.resetModeSettings();
			}

			if (this.currentMode.layers.layersUsed === true) {
				ui.showLayers(true);
			}
		}

		this.modeSettingsPress = (id, option) => {

			switch (id) {
				case "grid visibility":
					renderContext.gridVisibility = option;
				break
				case "show shadows":
					renderContext.useShadows = option;
				break
				case "debug shadows":
					renderContext.debugShadows = option;
				break
				case "render mode":
					renderContext.renderMode = option;
				break
				case "palette":
					renderContext.palette = option;
				break
			}

			this.currentMode.modeSettingsPress(id, option);
			console.log("mode setting button pressed: " + id + " option: " + option);
		}

		//key press events-=------------------------------------

		this.keyPress = (event) => {
			const pressedKey = event.key;
			if (pressedKey === "m") {
				document.getElementById("move view").click();
			}

			if (pressedKey !== "Control") {
				if (event.ctrlKey) {
					switch (pressedKey) {
						case "s":
							event.preventDefault();
							console.log("saved");
						break
						case "z":
							event.preventDefault();
							console.log("undone");
						break
						case "l":
							event.preventDefault();
							console.log("loaded");
						break
						case "y":
							event.preventDefault();
							console.log("redone");
						break
					}
				}
			}

			if (pressedKey in this.currentMode.capturedKeypresses) {
				event.preventDefault();
				this.currentMode.capturedKeypresses[pressedKey]();
			}
		}

		//editor methods ------------------------------------------------------------------
		this.setLevelName = (name) => {
			level.name = name;
		}

		this.initEditor = () => {
			this.modeButtonsPress(this.#currentMode);
		}
	}

	//private methods


	//private properties
	#currentMode = "geometry";
	#defaultModeButtons = [
		new ButtonOptions("grid visibility", "toggle", {contents : "grid\nvis", default : true}), 
		new ButtonOptions("show shadows", "toggle", {contents : "shadows", default : true}),
		new ButtonOptions("debug shadows", "toggle", {contents : "shdw\ndebug"}),
		new ButtonOptions("render mode", "cycle", {contents : "render\nmode", cycleOptions : ["final", "palette", "raw"]}),
		new ButtonOptions("palette", "cycle", {contents : "palette", cycleOptions : [0, 1, 6, 7, 9, 14, 30]})
	];

	//setters and getters

	/**
	 * @returns {Mode}
	 */
	get currentMode() {
		return this.modes[this.#currentMode];
	}

	set currentMode(modeChoice) {
		if (Object.keys(this.modes).includes(modeChoice)) {
			this.#currentMode = modeChoice;
		} else {
			throw new Error("mode choice \"" + modeChoice + "\" does not exist");
		}
	}

	get currentTool() {
		if (this.currentMode.currentTool === "move view") {
			return {
				id : "move view",
				needsMouseMovement : false,
				needsTileMovement : false,
				fn : () => {},
				previousAction : []
			}
		} else {
			return this.currentMode.tools[this.currentMode.currentTool];
		}
	}

	set currentTool(tool) {
		this.currentMode.currentTool = tool;
	}
}

class ModeSet {
	constructor() {
		this.geometry = new GeometryMode();
		this.materials = new MaterialsMode();
		this.effect = new GeometryMode();
		this.light = new GeometryMode();
		this.prop = new PropMode();
		this.palette = new GeometryMode();
		this.render = new GeometryMode();
	}
}
