import {vec2, vec3, vec4} from "./utils.mjs"
import {Level} from "./level.mjs"
import {Editor} from "./editor.mjs"
import {RenderContext} from "./render.mjs"
import {ui} from "./ui.mjs"
import { LingoParse } from "./lingo.mjs"

//initialise the editor
const initialLevelSize = new vec2(72, 43);

export const level = new Level(initialLevelSize);

export const editor = new Editor();

export const renderContext = new RenderContext(initialLevelSize, 20);

ui.initListeners();

let id;

globalThis.lingoParse = LingoParse.parse;

pixiApp.view.addEventListener("mousedown", (event) => {
	switch (event.button) {
		case 999:
				const start = Date.now();


			for (let i = 0; i < 2; i++) {
					for (let y = 0; y < initialLevelSize.y; y++) {
						for (let z = 0; z < 30; z++) {
							const pos = new vec3(i * (initialLevelSize.x - 1), y, z);
							if (y % 2 === 1) {
								renderContext.setTile(pos, "WHITE");
							} else {
								renderContext.setTile(pos, "default");
							}
						}
					}
				}

				for (let i = 0; i < 2; i++) {
					for (let x = 0; x < initialLevelSize.x; x++) {
						for (let z = 0; z < 30; z++) {
							const pos = new vec3(x, i * (initialLevelSize.y - 1), z);
							if (x % 2 === 1) {
								renderContext.setTile(pos, "WHITE");
							} else {
								renderContext.setTile(pos, "default");
							}
						}
					}
				}

				for (let x = 0; x < initialLevelSize.x; x++) {
					for (let y = 0; y < initialLevelSize.y; y++) {
						if (Math.random() > 0.75) {
							for (let z = 19; z < 30; z++) {
								const pos = new vec3(x, y, z);
								renderContext.setTile(pos, "WHITE");
							}
						}
					}
				}

				console.log(renderContext.setTileCount + " tiles rendered in " + (Date.now() - start) / 1000 + " seconds");


		break
		case 2:
			renderContext.skewAngle = renderContext.skewAngle;
		break
	}
})

pixiApp.view.addEventListener("mouseup", (event) => {
	switch (event.button) {
		case 0:
				clearInterval(id)
		break
	}
})


pixiApp.view.addEventListener("contextmenu", (event) => {
	event.preventDefault();
})