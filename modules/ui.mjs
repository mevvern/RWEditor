import {editor} from "./main.mjs";

export const ui = {};

const tiles = document.querySelector("#tiles"); //div that contains all tile related elements
const tools = document.querySelector("#tools");	//ditto for tools
const layers = document.querySelector("#layers"); //ditto for layers
const modeSettings = document.querySelector("#modeSettings"); //ditto for mode settings
const allTools = document.querySelector("#allTools"); //div that makes up the entire left shelf (tools in a collective sense)
const allSettings = document.querySelector("#allSettings"); //div that makes up the entire right shelf (settings, etc)

const tileButtons = [];
const toolButtons = [];

ui.createTileButtons = (ids) => {
	const buttonBox = tiles.querySelector("#tileButtons");

	//unhide the div
	tiles.setAttribute("hidden", "false");

	//iterate over each provided id
	for (const id of ids) {
		let button;
		if (id instanceof Array) {		//cycler button
			button = createButton(id[0]);

			button.options = id.slice(1);
			button.optionIndex = 0;

			button.addEventListener("mousedown", (event) => {
				event.stopPropagation();
				
				const button = event.currentTarget

				console.log(button.options[button.optionIndex]);

				//send the event to the editor with button id and option
				editor.tileButtonPress(button.id, button.options[button.optionIndex]);

				//increment option index by 1 or set it back to 0
				if (button.optionIndex < button.options.length - 1) {
					button.optionIndex++;
				} else {
					button.optionIndex = 0;
				}

				//reset all the buttons to selected=false
				for (const button of tileButtons) {
					button.setAttribute("selected", "false");
				}

				//set the desired button to selected=true
				event.currentTarget.setAttribute("selected", "true");
			})
		} else {											//normal button
			button = createButton(id);

			//attach the event listener to the button
			button.addEventListener("mousedown", (event) => {
				event.stopPropagation();
				editor.tileButtonPress(event.currentTarget.id);

				//reset all the buttons to selected=false
				for (const button of tileButtons) {
					button.setAttribute("selected", "false");
				}

				//set the desired button to selected=true
				event.currentTarget.setAttribute("selected", "true");
			})
		}
		
		//add the button to the places where they go
		buttonBox.appendChild(button);
		tileButtons.push(button);
	}
}

ui.createToolButtons = (ids) => {
	const buttonBox = tools.querySelector("#toolButtons");

	//unhide the div since if this function is being called then the div will be used
	tools.setAttribute("hidden", "false");
	tiles.setAttribute("showDivider", "true");

	//iterate over each provided id and make a button for it
	for (const [index, id] of ids.entries()) {
		
		//create the new button for the given id
		let button = createButton(id);
		
		//if there is a current tool selected, initialize that button to selected
		if (editor) {
			if (id === editor.currentMode.currentTool) {
				button.setAttribute("selected", "false");
			}
		} else {
			if (id === "move view") {
				button.setAttribute("selected", "false");
			}
		}
		
		//add the new button to the div, and also the array containing the buttons
		buttonBox.appendChild(button);
		toolButtons.push(button);
		
		//attach an event listener to the new button
		button.addEventListener("mousedown", (event) => {
			event.stopPropagation();
			editor.toolButtonPress(event.currentTarget.id);
			
			//set all buttons selection state to false
			for (const button of toolButtons) {
				button.setAttribute("selected", "false");
			}

			//set the chosen button to be selected
			event.currentTarget.setAttribute("selected", "true");
		})
	}
}

ui.createModeSettingsButtons = (buttonParamsList) => {
	const modeSettingsBox = modeSettings;

	for (const buttonParam of buttonParamsList) {
		const button = createButton(buttonParam.id, false);

		modeSettingsBox.appendChild(button)
		
		switch (buttonParam.type) {
			case "oneshot":
				button.setAttribute("type", "oneshot");
				button.innerHTML = buttonParam.id;
				button.addEventListener("mousdown", (event) => {
					editor.currentMode.modeSettingsPress(event.currentTarget.id);
				})
			break
			case "cycle":
				button.innerHTML = buttonParam.cycleOptions[0];

				button.setAttribute("cycleIndex", 0);
				button.setAttribute("cycleOptions", JSON.stringify(buttonParam.cycleOptions));
				button.setAttribute("type", "cycle");


				button.addEventListener("mousedown", (event) => {
					const button = event.currentTarget;

					let cycleIndex = parseInt(button.getAttribute("cycleIndex"));
					let cycleOptions = JSON.parse(button.getAttribute("cycleOptions"));

					if (cycleIndex >= cycleOptions.length - 1) {
						cycleIndex = 0;
						editor.currentMode.modeSettingsPress(button.id, cycleOptions[0]);
						button.innerHTML = cycleOptions[0]

					} else if (cycleIndex < cycleOptions.length - 1) {
						cycleIndex++
						editor.currentMode.modeSettingsPress(button.id, cycleOptions[cycleIndex])
						button.innerHTML = cycleOptions[cycleIndex];
					} 

					button.setAttribute("cycleIndex", cycleIndex);
				})
			break
			case "toggle":
				button.setAttribute("type", "toggle");
				button.innerHTML = buttonParam.id
				button.addEventListener("mousedown", (event) => {
					const button = event.currentTarget;
					if (button.getAttribute("selected") === "true") {
						editor.currentMode.modeSettingsPress(button.id, false);
						button.setAttribute("selected", "false");
					} else {
						editor.currentMode.modeSettingsPress(button.id, true);
						button.setAttribute("selected", "true");
					}
				})
			break
		}
	}
}

ui.enableLayers = () => {
	tools.setAttribute("showDivider", "true");
	layers.setAttribute("hidden", "false");
}

ui.clearButtons = () => {
	layers.setAttribute("hidden", "true")

	for (const button of tiles.querySelectorAll("button")) {
		button.remove();
	}
	//tiles.setAttribute("hidden", "true");
	
	for (const button of tools.querySelectorAll("button")) {
		button.remove();
	}
	//tools.setAttribute("hidden", "true");

	for (const button of modeSettings.querySelectorAll("button")) {
		button.remove();
	}
	//modeSettings.setAttribute("hidden", "true");

}

ui.initListeners = () => {
	const canvas = app.view;
	const modeButtons = document.querySelectorAll("#modeButtons > button");
	const levelName = document.querySelector("#levelName");
	const toolVisButton = document.querySelector("#toolCollapseButton");
	const settingsVisButton = document.querySelector("#settingsCollapseButton");
	const layerVisButtons = layers.querySelectorAll("#layerVis > button");
	const layerSelButtons = layers.querySelectorAll("#layerSel > button");

	levelName.addEventListener("input" , (event) => {
		editor.setLevelName(event.target.value);
		if (!event.target.value) {
			editor.setLevelName("Untitled Level");
			document.querySelector("title").innerHTML = "Untitled Level";
		}
	})

	document.addEventListener("mousemove", (event) => {
		editor.mouseMove(event);
	})
	
	document.addEventListener("keydown", (event) => {
		editor.keyPress(event);
	})

	canvas.addEventListener("wheel", (event) => {
		editor.scroll(event);
	})

	canvas.addEventListener("mousedown", (event) => {
		switch (event.button) {
			case 0: //left mouse pressed
				editor.mouseEvent.left.down();
			break
			case 2: //right mouse pressed
				editor.mouseEvent.right.down();
			break
			case 1: //middle mouse pressed
				editor.mouseEvent.middle.down();
			break
		}
	})
	
	window.addEventListener("mouseup", (event) => {
		switch (event.button) {
			case 0: //left mouse pressed
				editor.mouseEvent.left.up();
			break
			case 2: //right mouse pressed
				editor.mouseEvent.right.up();
			break
			case 1: //middle mouse pressed
				editor.mouseEvent.middle.up();
			break
		}
	})

	canvas.addEventListener("contextmenu", (event) => {
		event.preventDefault();
		event.stopPropagation();
	})

	settingsVisButton.addEventListener("mousedown", () => {
		if (allSettings.getAttribute("hidden") === "true") {
			allSettings.setAttribute("hidden", "false");
			settingsVisButton.innerHTML = "hide settings";
			settingsVisButton.setAttribute("title", "hide the settings box");
		} else {
			allSettings.setAttribute("hidden", "true");
			settingsVisButton.innerHTML = "show settings";
			settingsVisButton.setAttribute("title", "show the settings box");
		}
	})

	toolVisButton.addEventListener("mousedown", () => {
		if (allTools.getAttribute("hidden") === "true") {
			allTools.setAttribute("hidden", "false");
			toolVisButton.innerHTML = "hide tools";
			toolVisButton.setAttribute("title", "hide the tool box");
		} else {
			allTools.setAttribute("hidden", "true");
			toolVisButton.innerHTML = "show tools";
			toolVisButton.setAttribute("title", "show the tool box");
		}
	})

	for (const button of layerVisButtons) {
		button.addEventListener("mousedown", (event) => {
			editor.layerVisPress(event.currentTarget.getAttribute("number"));
			for (const [index, value] of editor.currentMode.layerVisibility) {
				const button = layers.querySelector("#vis" + index);
				if (value === 1) {
					button.setAttribute("selected", "true");
				} else {
					button.setAttribute("selected", "false");
				}
			}
		})
	}

	layerSelButtons.forEach(button => {
		button.addEventListener("mousedown", (event) => {
			editor.layerChoicePress(event.currentTarget.getAttribute("number"));
			layerSelButtons.forEach(button => {
				button.setAttribute("selected", "false");
			})
			event.currentTarget.setAttribute("selected", "true");
		})
	})

	modeButtons.forEach(button => {
		button.addEventListener("mousedown", (event) => {
			editor.modeButtonPress(event.currentTarget.id);
			modeButtons.forEach(button => {
				button.setAttribute("selected", "false");
			})
			event.currentTarget.setAttribute("selected", "true");
		})
	})

	//toolVisButton.dispatchEvent(new MouseEvent("mousedown"));
	//settingsVisButton.dispatchEvent(new MouseEvent("mousedown"));
}

function createButton (id, usesIcon) {
	const button = document.createElement("button");
	const icon = document.createElement("img");
	button.setAttribute("id", id);
	button.setAttribute("customTitle", id);
	button.setAttribute("selected", "false");

	if (!(usesIcon === false)) {
		icon.setAttribute("src", "../resources/buttonIcons/" + id + ".png");
		icon.setAttribute("draggable", "false");
	}

	button.appendChild(icon);

	return button;
} 