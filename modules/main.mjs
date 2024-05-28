import * as PIXI from "./lib/pixi.mjs"

globalThis.app = new PIXI.Application({background : "#7788af", resizeTo : window});
globalThis.PIXI_LIB = PIXI;
globalThis.__PIXI_APP__ = app;
//window.__PIXI_DEVTOOLS__ = {app : app, pixi : PIXI};

import {prng, vec2, vec3, vec4} from "./utils.mjs"
import {Level} from "./level.mjs"
import {Editor} from "./editor.mjs"
import {RenderContext} from "./render.mjs"
import {ui} from "./ui.mjs"
import {Area} from "./utils.mjs"

globalThis.DEFAULT_TILE_SIZE = 20;

const initialLevelSize = new vec2(72, 43);

globalThis.DEFAULT_TEXTURE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUBAMAAAB/pwA+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAPcA/dbgUjsAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAWSURBVBjTYwADQRCgB5NuFjEwMDAAANtyBqXVH2kBAAAAAElFTkSuQmCC");
globalThis.WHITE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAoSURBVDhPY/wPBAxUBExQmmpg1EDKwaiBlINRAykHowZSDga7gQwMALMVBCT26vD0AAAAAElFTkSuQmCC");
globalThis.INVISIBLE = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVDhPYxgFo2AUjIJRMAqoAhgYAAZUAAE6HI5PAAAAAElFTkSuQmCC");
INVISIBLE.id = "INVISIBLE"
DEFAULT_TEXTURE.id = "DEFAULT"
WHITE.id = "WHITE"


//initialise the editor

export const level = new Level(initialLevelSize);

export const editor = new Editor();

export const renderContext = new RenderContext(initialLevelSize);

ui.initListeners();

editor.initEditor();