import {editor, level, renderContext} from "./main.mjs";

export const ui = {};

ui.initListeners = () => {
	const canvas = app.view;
	const modeButtons = document.querySelectorAll("#modeButtons > button");
	const levelName = document.querySelector("#levelName");
	const shadowMagnitude = document.querySelector("#shadowMagnitude");
	const shadowAngle = document.querySelector("#shadowAngle");
	const toolVisButton = document.querySelector("#toolCollapseButton");
	const settingsVisButton = document.querySelector("#settingsCollapseButton");
	const layerVisButtons = layers.querySelectorAll("#layerVis > button");
	const layerSelButtons = layers.querySelectorAll("#layerSel > button");
	const allTools = document.querySelector("#allTools");
	const allSettings = document.querySelector("#allSettings");

	levelName.addEventListener("input" , (event) => {
		editor.setLevelName(event.target.value);
		if (!event.target.value) {
			editor.setLevelName("Untitled Level");
			document.querySelector("title").innerHTML = "Untitled Level";
		} else {
			document.querySelector("title").innerHTML = level.name;
		}
	})

	shadowAngle.addEventListener("input" , (event) => {
		renderContext.shadowAngle = event.target.value / 180;
		document.querySelector("#shadowAngleLabel").innerHTML = `angle: ${event.target.value}°`
	})

	shadowMagnitude.addEventListener("input" , (event) => {
		renderContext.shadowMagnitude = event.target.value / 100000;
		document.querySelector("#shadowMagnitudeLabel").innerHTML = `length: ${event.target.value / 100}`
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
			
			for (const [index, value] of editor.currentMode.layers.visibility.entries()) {
				const button = layers.querySelector("#vis" + index);
				if (value === true) {
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
			editor.modeButtonsPress(event.currentTarget.id);
			modeButtons.forEach(button => {
				button.setAttribute("selected", "false");
			})
			event.currentTarget.setAttribute("selected", "true");
		})
	})
}

ui.showLayers = (bool) => {
	const layerBox = document.getElementById("layers");

	if (bool === true) {
		layerBox.setAttribute("hidden", "false");

	} else {
		layerBox.setAttribute("hidden", "true");
	}
}

ui.clearUi = () => {
	for (const element of document.querySelectorAll("[clearable]")) {
		element.remove();
	}

	ui.showLayers(false);
}

/**
 * @param {Array} buttonList - the array which contains all the button ids and their optional parameters
 * @param {string} destination - the destination on the page for the list of buttons
 * @param {string} preselected - the id of the button which should be preselected. nothing will be selected if left out
 */
ui.generateButtonSet = (buttonOptionsList, destination, preselected) => {
	const destinationBox = document.getElementById(destination);

	if (destinationBox) {
		let oneSelectedFlag = false;

		for (let buttonOptions of buttonOptionsList) {
			if (typeof buttonOptions === "string") {
				buttonOptions = new ButtonOptions(buttonOptions, "oneSelected", {contents : "image"});
			}

			if (buttonOptions.type.includes("oneSelected")) {
				oneSelectedFlag = true;
			}

			if (oneSelectedFlag === true && (buttonOptions.type === "toggle")) {
				console.warn("a oneSelected button probably shouldn't be located alongside a toggle button");
			}

			const button = createButton(buttonOptions);

			if (button.id === preselected) {
				button.setAttribute("selected", "true");
			}

			destinationBox.appendChild(button);
		}
	
	} else {
		throw new Error("button destination \"" + destination + "\" doesn't exist");
	}
}


/**
 * @param {ButtonOptions} buttonOptions
 * @returns {HTMLButtonElement}
 */
function createButton(buttonOptions) {
	if (buttonOptions instanceof ButtonOptions) {
		const button = document.createElement("button");

		button.id = buttonOptions.id;
		button.setAttribute("clearable", "");
		button.setAttribute("type", buttonOptions.type);
		button.setAttribute("customTitle", buttonOptions.id);

		if (buttonOptions.type === "cycle") {
			const cycleOptions = JSON.stringify(buttonOptions.cycleOptions);

			button.setAttribute("cycleOptions", cycleOptions);
			button.setAttribute("cycleIndex", buttonOptions.cycleOptions.indexOf(buttonOptions.default));

			button.innerHTML = buttonOptions.default;

			button.addEventListener("mousedown", cycleCallback)
 		}

		if (buttonOptions.type === "oneSelectedCycle") {
			const cycleOptions = JSON.stringify(buttonOptions.cycleOptions);

			button.setAttribute("cycleOptions", cycleOptions);
			button.setAttribute("cycleIndex", buttonOptions.cycleOptions.indexOf(buttonOptions.default));

			button.innerHTML = buttonOptions.default;

			button.addEventListener("mousedown", oneSelectedCycleCallback);
 		}

		if (buttonOptions.type === "toggle") {
			if (buttonOptions.default === true) {
				button.setAttribute("selected", "true");
			} else {
				button.setAttribute("selected", "false");
			}
			button.addEventListener("mousedown", toggleCallback);
		}

		if (buttonOptions.type === "oneshot") {
			button.addEventListener("mousedown", oneshotCallback);
		}

		if (buttonOptions.type === "oneSelected") {
			button.addEventListener("mousedown", oneSelectedCallback)
		}

		if (buttonOptions.contents === "image") {
			button.setAttribute("hasImage", "")
			button.innerHTML = `<img src="./resources/buttonIcons/${buttonOptions.id}.png"></img>`;

		} else if (button.type != "cycle") {
			button.innerHTML = buttonOptions.contents;
		}

		return button;

	} else {
		throw new TypeError("createButton only accepts instances of ButtonOptions");
	}
}


//---------------------classes--------------------------------//

export class ButtonOptions {
	/**
	 * 
	 * @param {String} id - the id of the button
	 * @param {String} type - the type of the button
	 * @param {Object} options - default : the starting state of the button. can be true, false, or a cycle option. not applicable to oneshots 
	 * @param {Object} options - contents : the contents of the button. can be any string, or "image" to be an image with the path "resources/icons/<id>.png". if left out the id will become the contents
	 * @param {Object} options - cycleOptions : the list of options to cycle through if the type is a cycler
	 * @param {Object} options - textures : the list of texture ids which renderContext will grab
	 */
	constructor(id, type, options) {
		this.id = id;
		if (!options) {
			options = {};
		}

		if (options.default) {	
			this.default = options.default;
		} else {
			this.default = null;
		}

		if (options.textures) {
			this.textures = options.textures;
		}

		if (options.contents) {
			switch(options.contents) {
				default:
					this.contents = options.contents;
				break
				case "image":
					this.contents = "image";
				break
			}
		} else {
			this.contents = id;
		}

		switch (type) {
			default:
				this.type = "toggle";
				console.log("[ButtonOptions] -- defaulted to type toggle for id: " + id);
				this.default = false;
			break
			case "toggle":
				this.type = "toggle";
				this.default = false;
			break
			case "cycle":
				if ((!(options.cycleOptions instanceof Array)) || options.cycleOptions.length < 2 ) {
					throw new Error("[ButtonOptions] [id: " + id +"] -- must provide at least two options to cycle through")
				} 
				this.type = "cycle";
				this.cycleOptions = options.cycleOptions;
				this.default = this.cycleOptions[0];
			break
			case "oneshot":
				this.type = "oneshot";
				this.default = null;
			break
			case "oneSelected":
				this.type = "oneSelected"
				this.default = null;
			break
			case "oneSelectedCycle":
				if ((!(options.cycleOptions instanceof Array)) || options.cycleOptions.length < 2 ) {
					throw new Error("[ButtonOptions] [id: " + id +"] -- must provide at least two options to cycle through")
				} 
				this.type = "oneSelectedCycle";
				this.cycleOptions = options.cycleOptions;
				this.default = this.cycleOptions[0];
			break
		}

		if (options.default) {
			this.default = options.default;
		}
	}
}



/**
 * @param {MouseEvent} event
 */
function oneSelectedCycleCallback (event) {
	const button = event.currentTarget;
	const handler = editor[button.parentNode.id + "Press"];

	console.log("oneselectedcycle")

	const cycleOptions = JSON.parse(button.getAttribute("cycleOptions"));
	const hasImage = button.getAttribute("hasImage");
	let cycleIndex = parseInt(button.getAttribute("cycleIndex"));


	if (button.getAttribute("selected") === "false") {
		handler(button.id, cycleOptions[cycleIndex]);
		if (hasImage === null) {
			button.innerHTML = cycleOptions[cycleIndex];
		}

		for (const buttonElement of button.parentNode.querySelectorAll("button")) {
			buttonElement.setAttribute("selected", "false");
		}

		button.setAttribute("selected", "true");

	} else if (cycleIndex >= cycleOptions.length - 1) {
		cycleIndex = 0;
		handler(button.id, cycleOptions[0]);
		if (hasImage === null) {
			button.innerHTML = cycleOptions[cycleIndex];
		}

	} else {
		cycleIndex++;
		handler(button.id, cycleOptions[cycleIndex]);
		if (hasImage === null) {
			button.innerHTML = cycleOptions[cycleIndex];
		}
	} 

	button.setAttribute("cycleIndex", cycleIndex);
}

function oneSelectedCallback (event) {
	const button = event.currentTarget
	const handler = editor[button.parentNode.id + "Press"];

	for (const buttonElement of button.parentNode.querySelectorAll("button")) {
		buttonElement.setAttribute("selected", "false");
	}

	button.setAttribute("selected", "true");

	handler(button.id);
}

/**
 * @param {MouseEvent} event
 */
function oneshotCallback (event) {
	const button = event.currentTarget
	const handler = editor[button.parentNode.id + "Press"];

	handler(button.id);
}

/**
 * @param {MouseEvent} event
 */
function toggleCallback (event) {
	const button = event.currentTarget
	const handler = editor[button.parentNode.id + "Press"];

	if (button.getAttribute("selected") === "false") {
		button.setAttribute("selected", "true");
		handler(button.id, true);

	} else {
		button.setAttribute("selected", "false");
		handler(button.id, false);

	}
}

/**
 * @param {MouseEvent} event
 */
function cycleCallback (event) {
	const button = event.currentTarget;
	const handler = editor[button.parentNode.id + "Press"];

	const cycleOptions = JSON.parse(button.getAttribute("cycleOptions"));
	const hasImage = button.getAttribute("hasImage");
	let cycleIndex = parseInt(button.getAttribute("cycleIndex"));


	if (cycleIndex >= cycleOptions.length - 1) {
		cycleIndex = 0;
		handler(button.id, cycleOptions[0]);
		if (hasImage === null) {
			button.innerHTML = cycleOptions[cycleIndex];
		}

	} else {
		cycleIndex++;
		handler(button.id, cycleOptions[cycleIndex]);
		if (hasImage === null) {
			button.innerHTML = cycleOptions[cycleIndex];
		}
	} 

	button.setAttribute("cycleIndex", cycleIndex);
}