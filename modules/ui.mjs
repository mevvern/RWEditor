import {editor} from "./main.mjs";

export const ui = {};

ui.initListeners = () => {
	const canvas = app.view;
	const modeButtons = document.querySelectorAll("#modeButtons > button");
	const levelName = document.querySelector("#levelName");
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
				oneSelectedFlag = true;
				buttonOptions = new ButtonOptions(buttonOptions, "oneSelected", "image");
			}

			if (oneSelectedFlag === true && buttonOptions.type === "toggle") {
				throw new TypeError("a oneSelected button cannot be located alongside a toggle button");
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
			button.setAttribute("cycleIndex", 0);

			button.innerHTML = buttonOptions.cycleOptions[0];

			button.addEventListener("mousedown", cycleCallback)
 		}

		if (buttonOptions.type === "oneSelectedCycle") {
			const cycleOptions = JSON.stringify(buttonOptions.cycleOptions);

			button.setAttribute("cycleOptions", cycleOptions);
			button.setAttribute("cycleIndex", 0);

			button.innerHTML = buttonOptions.cycleOptions[0];

			button.addEventListener("mousedown", oneSelectedCallback);
 		}

		if (buttonOptions.type === "toggle") {
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
	 * @param {String} contents - tells what should be inside the button. defaults to being the string itself. can also be "image" for an image specified by the id of the button, or "id" for the id of the button
	 * @param {Array} cycleOptions 
	 * @param {Object} metaData
	 */
	constructor(id, type, contents, cycleOptions, metaData) {
		this.id = id;
		this.metaData = metaData;

		switch (type) {
			default:
				this.type = "toggle";
				console.log("[ButtonOptions] -- defaulted to type toggle for id: " + id);
			break
			case "toggle":
				this.type = "toggle";
			break
			case "cycle":
				if ((!(cycleOptions instanceof Array)) || cycleOptions.length < 2 ) {
					console.log(cycleOptions.length)
					throw new Error("[ButtonOptions] [id: " + id +"] -- must provide at least two options to cycle through")
				} 
				this.type = "cycle";
				this.cycleOptions = cycleOptions;
			break
			case "oneshot":
				this.type = "oneshot";
			break
			case "oneSelected":
				this.type = "oneSelected"
			break
			case "oneSelectedCycle":
				if ((!(cycleOptions instanceof Array)) || cycleOptions.length < 2 ) {
					console.log(cycleOptions.length)
					throw new Error("[ButtonOptions] [id: " + id +"] -- must provide at least two options to cycle through")
				} 
				this.type = "oneSelectedCycle";
				this.cycleOptions = cycleOptions;
			break
		}

		switch(contents) {
			default:
				this.contents = contents;
			break
			case "image":
				this.contents = "image";
			break
			case "id":
				this.contents = id;
			break
		}
	}
}



/**
 * @param {MouseEvent} event
 */
function oneSelectedCycleCallback (event) {
	const button = event.currentTarget;
	const handler = editor[button.parentNode.id + "Press"];

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

	if (button.getAttribute("boolean") === "true") {
		button.setAttribute("boolean", "false");
		button.setAttribute("selected", "false");
		handler(button.id, false);

	} else {
		button.setAttribute("boolean", "true");
		button.setAttribute("selected", "true");
		handler(button.id, true);
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