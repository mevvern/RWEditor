import {vec2, vec3, vec4} from "./utils.mjs"
import {Level} from "./level.mjs"
import {Editor} from "./editor.mjs"
import {RenderContext} from "./render.mjs"
import {ui} from "./ui.mjs"
import {Area} from "./utils.mjs"
import * as PIXI from "./lib/pixi.mjs"

globalThis.app = new PIXI.Application({background : "#7788af", resizeTo : window});
window.__PIXI_DEVTOOLS__ = {
  pixi: PIXI,
  app: app
};

globalThis.DEFAULT_TEXTURE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUBAMAAAB/pwA+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAPcA/dbgUjsAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAWSURBVBjTYwADQRCgB5NuFjEwMDAAANtyBqXVH2kBAAAAAElFTkSuQmCC");
globalThis.WHITE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAoSURBVDhPY/wPBAxUBExQmmpg1EDKwaiBlINRAykHowZSDga7gQwMALMVBCT26vD0AAAAAElFTkSuQmCC");
globalThis.INVISIBLE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVDhPYxgFo2AUjIJRMAqoAhgYAAZUAAE6HI5PAAAAAElFTkSuQmCC");
INVISIBLE.id = "INVISIBLE"
DEFAULT_TEXTURE.id = "DEFAULT"
WHITE.id = "WHITE"


//initialise the editor
const initialLevelSize = new vec2(72, 43);

export const level = new Level(initialLevelSize);

export const editor = new Editor();

export const renderContext = new RenderContext(initialLevelSize, 20);

ui.initListeners();

globalThis.Area = Area;
globalThis.vec2 = vec2;
globalThis.vec3 = vec3;
globalThis.vec4 = vec4;

app.view.addEventListener("mousedown", (event) => {
	switch (event.button) {
		case 0:
				const start = Date.now();

				const tiles = [];

				for (let i = 0; i < 2; i++) {
					for (let y = 0; y < initialLevelSize.y; y++) {
						for (let z = 0; z < 30; z++) {
							const pos = new vec3(i * (initialLevelSize.x - 1), y, z);
							if (y % 2 === 1) {
								tiles.push({pos : pos, texture : "WHITE"});
							} else {
								tiles.push({pos : pos, texture : "DEFAULT"});
							}
						}
					}
				}

				for (let i = 0; i < 2; i++) {
					for (let x = 0; x < initialLevelSize.x; x++) {
						for (let z = 0; z < 30; z++) {
							const pos = new vec3(x, i * (initialLevelSize.y - 1), z);
							if (x % 2 === 1) {
								tiles.push({pos : pos, texture : "WHITE"});
							} else {
								tiles.push({pos : pos, texture : "DEFAULT"});
							}
						}
					}
				}

				for (let x = 0; x < initialLevelSize.x; x++) {
					for (let y = 0; y < initialLevelSize.y; y++) {
						if (Math.random() > 0.75) {
							for (let z = 19; z < 30; z++) {
								const pos = new vec3(x, y, z);
								tiles.push({pos : pos, texture : "WHITE"});
							}
						}
					}
				}

				renderContext.setTile(new Area(tiles))

				console.log(renderContext.setTileCount + " tiles rendered in " + (Date.now() - start) / 1000 + " seconds");

				renderContext.setTileCount = 0;

		break
		case 1:
			//renderContext.clearRenders();
		break
		case 2:
			renderContext.renderAll();
	}
})

app.view.addEventListener("contextmenu", (event) => {
	event.preventDefault();
})