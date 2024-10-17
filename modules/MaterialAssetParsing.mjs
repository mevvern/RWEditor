import * as PIXI from "./lib/pixi.mjs";
import {generateFrame, hashString, pluralize, vec2, vec3, vec4} from "./utils.mjs";

export class MaterialAssetParser {
	static initMaterials = getDefaultMaterials;
}

/*
	"Material Name" : {		//the name of the material

		"baseSize" : 20, 		//the size of the basic unit of the material in pixels, can be any size

		"type" : "tile",		//the type of the tile, this is what determines how you lay out your assets

		"geometry" : {			//this tells which layers of the material get put into the finished tile. unused for the "random" type. 
												//if a geometry type isn't listed here it will have the default layout
		},

	},
*/

async function initMaterials(defaultMaterials) {
	const materialData = await getMaterialJson();
	const materialPromises = [];

	//iterate over the object containing all the materials' config data
	for (const materialId in materialData) {
		const materialParams = materialData[materialId];
		materialParams.id = materialId;

		//make sure the material type exists/wasn't typo-ed
		if (materialParsingFucntions.allowedMaterialTypes.includes(materialParams.type) ) {
			//check that the list of included tile types exists 
			if (materialParams.includedTileTypes || materialParams.type === "mask" || materialParams.type === "random") {
				//check for duplicated material names and warn the user that it will be overwritten with the next one 
				for (const materialName in materialPromises) {
					if (materialId === materialName) {
						console.warn(`[Material Generator] material "${materialId}" is duplicated, and it will be overwritten`);
					}
				}

				//check for and delete incorrectly spelled tile types so they dont break things later
				for (const tileType in materialParams.includedTileTypes) {
					if (!(tileType in materialParsingFucntions.defaultLayerSetup)) {
						delete materialParams.includedTileTypes[tileType];
						console.warn(`[Material Generator] skipping tile type "${tileType}" in material "${materialId}" because its name is mistyped or does not exist`);
					}
				}

			materialPromises.push(generateMaterial(materialParams, defaultMaterials[materialParams.type]));

			} else {
				//skip the material and warn the user that they must include a list of tile types included in the material
				console.warn(`[Material Generator] skipping material "${materialId}" because it is missing an "includedTileTypes" tag, which should have a list of the tile types your material adds`)
			}
		} else {
			//skip the material and warn the user that its type is not one of the allowed ones
			console.warn(`[Material Generator] skipping material "${materialId}" because it has an unknown type "${materialParams.type}"`);
		}
	}
	return materialPromises;
}

function generateMaterial (materialParams, defaultMaterial) {
	const included = materialParams.includedTileTypes

	//early return for materials that dont use any of this shit
	if (materialParams.type === "random" || materialParams.type === "mask") {
		return materialParsingFucntions[materialParams.type](materialParams, defaultMaterial);
	}

	if (!materialParams.variants) {
		materialParams.variants = 1;
	}

	if (!materialParams.spacing) {
		materialParams.spacing = 1;
	}

	if (Object.keys(included).includes("slope")) {
		included["slope BL"] = included.slope;
		included["slope TL"] = included.slope;
		included["slope TR"] = included.slope;
		included["slope BR"] = included.slope;

		delete included.slope;
	}

	if (Object.keys(included).includes("pole")) {
		included["pole H"] = included.pole;
		included["pole V"] = included.pole;

		delete included.pole;
	}

	for (const tileTypeId in included) {

		if (included[tileTypeId] === "default") {
			included[tileTypeId] = materialParsingFucntions.defaultLayerSetup[tileTypeId];
		}

		if (included[tileTypeId].length != 10) {
			console.warn(`[Material Generator] tile layer setup "${tileTypeId}" in material "${materialParams.id}" has length other than 10, reverting to default layer setup`);
			included[tileTypeId] = materialParsingFucntions.defaultLayerSetup[tileTypeId];
		}

		included[tileTypeId].layerCount = Math.max(...included[tileTypeId]) - 1;
	}

	return materialParsingFucntions[materialParams.type](materialParams, defaultMaterial);
}

async function getDefaultMaterials () {
	const defaultMaterials = []

	//default material cant be supplied because it doesnt exist yet. good thing we dont need any of the defaults :3
	for (const materialId in materialParsingFucntions.defaultMaterials) {
		defaultMaterials.push(generateMaterial(materialParsingFucntions.defaultMaterials[materialId], null));
	}

	const defaultMaterialsArray = await Promise.all(defaultMaterials)
	const defaultMaterialsObject = {};

	for (const material of defaultMaterialsArray) {
		defaultMaterialsObject[material.type] = material;
	}

	const materialPromises = await initMaterials(defaultMaterialsObject)

	return materialPromises;
}

//------------------------------------material creation------------------------------------//

async function parseTile (params, defaultMaterial) {
	const finishedMaterial = {};

	finishedMaterial.id = params.id;
	finishedMaterial.variantCount = params.variants;
	finishedMaterial.variants = [];
	finishedMaterial.type = "tile";

	for (let variantIndex = 0; variantIndex < params.variants; variantIndex++) {
		const currentMaterialVariant = new MaterialVariant();
		const listOfTiles = Object.keys(params.includedTileTypes);

		for (const tileType of materialParsingFucntions.allowedTileTypes) {
			let currentTile = {};

			if (listOfTiles.includes(tileType)) {
				const pathToTexture = `./resources/materials/${params.id}/${variantIndex}/${tileType}.png`

				const rawTextures = await chopATexture(params.spacing, params.baseSize, new vec2(1, params.includedTileTypes[tileType].layerCount), pathToTexture);

				currentTile.textures = [];

				let defaultBaselineNormalTexture;

				if (!(tileType in DEFAULT_MATERIAL_TEXTURES)) {
					defaultBaselineNormalTexture = DEFAULT_MATERIAL_TEXTURES["wall"];
				} else {
					defaultBaselineNormalTexture = DEFAULT_MATERIAL_TEXTURES[tileType];
				}

				currentTile.textures[0] = rawTextures;
				currentTile.textures[0].unshift(INVISIBLE, defaultBaselineNormalTexture);

				currentTile.layers = params.includedTileTypes[tileType];
			} else {
				if (params.id.includes("default")) {
					console.warn("default material is trying to get default tile.... shitty")
				}
				//get the tile from the default material
				currentTile = defaultMaterial.variants[0][tileType];
			}

			currentMaterialVariant[tileType] = currentTile;
		}

		currentMaterialVariant["air"] = {layers : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};

		finishedMaterial.variants.push(currentMaterialVariant);
	}

	return finishedMaterial;
}

async function parseSimpleConnected (params, defaultMaterial) {
	function getCorrectTexIndex (tileType, dimensions) {
		if (tileType === "wall") {
			return 16;
		} else {
			return dimensions.x
		}
	}
	const finishedMaterial = {};

	finishedMaterial.id = params.id;
	finishedMaterial.variantCount = params.variants;
	finishedMaterial.variants = [];
	finishedMaterial.type = "simpleConnected";

	for (let variantIndex = 0; variantIndex < params.variants; variantIndex++) {
		const currentMaterialVariant = new MaterialVariant();
		const listOfTiles = Object.keys(params.includedTileTypes);

		for (const tileType of materialParsingFucntions.allowedTileTypes) {
			let currentTile = {};

			if (listOfTiles.includes(tileType)) {
				const pathToTexture = `./resources/materials/${params.id}/${variantIndex}/${tileType}.png`

				const dimensions = new vec2();

				switch(tileType) {
					case "wall":
						dimensions.x = 4;
						dimensions.y = 4 * params.includedTileTypes[tileType].layerCount;
					break
					case "slope BL":
					case "slope TL":
					case "slope TR":
					case "slope BR":
						dimensions.x = 4;
						dimensions.y = params.includedTileTypes[tileType].layerCount;
					break
					case "pole V":
					case "pole H":
					case "cross pole":
						dimensions.x = 1;
						dimensions.y = params.includedTileTypes[tileType].layerCount;
					break
					case "semisolid platform":
						dimensions.x = 4;
						dimensions.y = params.includedTileTypes[tileType].layerCount;
					break
				}

				const rawTextures = await chopATexture(params.spacing, params.baseSize, dimensions, pathToTexture);

				currentTile.textures = [];

				let defaultBaselineNormalTexture;

				if (!(tileType in DEFAULT_MATERIAL_TEXTURES)) {
					defaultBaselineNormalTexture = DEFAULT_MATERIAL_TEXTURES["wall"];
				} else {
					defaultBaselineNormalTexture = DEFAULT_MATERIAL_TEXTURES[tileType];
				}

				for (let optionIndex = 0; optionIndex < getCorrectTexIndex(tileType, dimensions); optionIndex++) {
					currentTile.textures.push(new TileOption);
					for (let layerIndex = 0; layerIndex < params.includedTileTypes[tileType].layerCount; layerIndex++) {
						currentTile.textures[optionIndex].unshift(rawTextures[(optionIndex * layerIndex) + optionIndex]);
					}
					currentTile.textures[optionIndex].unshift(INVISIBLE, defaultBaselineNormalTexture);
				}

				currentTile.layers = params.includedTileTypes[tileType];
			} else {
				if (params.id.includes("default")) {
					console.warn("default material is trying to get default tile.... shitty")
				}
				//get the tile from the default material
				currentTile = defaultMaterial.variants[0][tileType];
			}

			currentMaterialVariant[tileType] = currentTile;
		}

		currentMaterialVariant["air"] = {layers : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};

		finishedMaterial.variants.push(currentMaterialVariant);
	}

	return finishedMaterial;
}

async function parseComplexConnected (params, defaultMaterial) {
	return new PlaceHolderMaterial(`complexConnected`, params.id);
}

async function parseMask (params, defaultMaterial) {
	return new PlaceHolderMaterial(`mask`, params.id);
}

async function parseRandom (params, defaultMaterial) {
	return new PlaceHolderMaterial(`random`, params.id);
}

//supportive functions

//bad shit here
const materialParsingFucntions = {
	allowedMaterialTypes : ["tile", "simpleConnected", "complexConnected", "mask", "random"],

	allowedTileTypes : ["wall", "slope BL", "slope TL", "slope TR", "slope BR", "pole V", "pole H", "cross pole", "semisolid platform", "cool scug"],

	defaultMaterials : {
		defaultTile : {
			id : "defaultTile",
			type : "tile",
			baseSize : 20,
			variantCount : 1,
			includedTileTypes : {
				wall : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				slope : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				"semisolid platform" : [0, 0, 0, 0, 0, 2, 3, 4, 5, 6],
				pole : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cross pole" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cool scug" : [0, 0, 0, 2, 2, 2, 2, 2, 0, 0]
			}
		},
		defaultSimpleConnected : {
			id : "defaultSimpleConnected",
			type : "simpleConnected",
			baseSize : 20,
			variantCount : 1,
			includedTileTypes : {
				wall : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				slope : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				"semisolid platform" : [0, 0, 0, 0, 0, 2, 3, 4, 5, 6],
				pole : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cross pole" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cool scug" : [0, 0, 0, 2, 2, 2, 2, 2, 0, 0]
			}
		},
		defaultComplexConnected : {
			id : "defaultComplexConnected",
			type : "complexConnected",
			baseSize : 20,
			variantCount : 1,
			includedTileTypes : {
				wall : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				slope : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				"semisolid platform" : [0, 0, 0, 0, 0, 2, 3, 4, 5, 6],
				pole : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cross pole" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
				"cool scug" : [0, 0, 0, 2, 2, 2, 2, 2, 0, 0]
			}
		},
		defaultRandom : {
			id : "defaultRandom",
			type : "random",
			baseSize : 20,
		},
		defaultMask : {
			id : "defaultMask",
			type : "mask",
			baseSize : 40,
			baseMaterial : "defaultTile"
		}
	},

	defaultLayerSetup : {
		wall : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		"slope BL" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		"slope TL" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		"slope TR" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		"slope BR" : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		"semisolid platform" : [0, 0, 0, 0, 0, 2, 3, 4, 5, 6],
		"pole V" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
		"pole H" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
		"cross pole" : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
		"cool scug" : [0, 0, 0, 2, 2, 2, 2, 2, 0, 0],
		slope : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		pole : [0, 0, 0, 0, 2, 2, 0, 0, 0, 0]
	},

	tile : parseTile,
	simpleConnected : parseSimpleConnected,
	complexConnected : parseComplexConnected,
	mask : parseMask,
	random : parseRandom
}

async function getMaterialJson () {
	const materialJson = await fetch("./resources/materials/materials.json").catch(() => {
		console.warn("materials.json is missing");
		return null;
	});

	return materialJson.json();
}

async function chopATexture (spacing, size, dimensions, path) {
	const data = generateSheetData(spacing, size, dimensions);
	const texture = await PIXI.Texture.fromURL(path);
	let spriteIndex = 0;

	const sheet = new PIXI.Spritesheet(texture, data);

	await sheet.parse().catch(() => {
		console.warn(`failed to parse spritesheet; ensure texture is laid out right\ntexture path: ${path}\nthe texture should be ${pluralize(dimensions.x, "sprite")} wide and ${pluralize(dimensions.y, "sprite")} tall.\neach sprite should be ${pluralize(size, "pixel")} wide and the spacing between them should be ${pluralize(dimensions.x, "pixel")}\nthe texture's total dimensions should be ${(dimensions.x * (size + spacing)) - spacing} pixels by ${(dimensions.y * (size + spacing)) - spacing} pixels`)
	});

	PIXI.utils.clearTextureCache();

	const textureArray = [];

	for (const textureIndex in sheet.textures) {
		const texture = sheet.textures[textureIndex];
		texture.id = hashString(path + texture.textureCacheIds[0]);
		//spriteIndex++;
		textureArray.push(sheet.textures[textureIndex])
	}
	return textureArray;
}

function generateSheetData (spacing, size, dimensions) {
	const data = {}

	data.frames = {}
	data.meta = {scale : 1}
	//data.minRequiredSize = new vec2(dimensions.x * size + ((dimensions.x * spacing) - spacing), dimensions.y * size + ((dimensions.y * spacing) - spacing))

	for (let x = 0; x < dimensions.x; x++) {
		for (let y = 0; y < dimensions.y; y++) {
			const sourceRect = new vec4();

			sourceRect.x = x * (size + spacing);
			sourceRect.y = y * (size + spacing);
			sourceRect.z = size;
			sourceRect.w = size;

			data.frames[(y * dimensions.x) + x] = generateFrame(sourceRect);
		}
	}

	return data;
}

export class PlaceHolderMaterial {
	constructor(str, id) {
		this.type = str;
		this.id = id;
	}
}

class MaterialVariant {
	constructor() {};
}

class TileOption extends Array{
	constructor() {
		super();
	};
}

class LayerSet extends Array {
	constructor() {
		super();
	}
}
