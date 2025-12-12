import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	DEBUG,
	images,
	npcs,
	objects,
	sounds,
} from "../globals.js";
import NPC from "../entities/NPC.js";
import NPCFactory from "./NpcFactory.js";
import SoundName from "../enums/SoundName.js";
import ObjectFactory from "./ObjectFactory.js";

export default class Map {
	/**
	 * The collection of layers, sprites,
	 * and characters that comprises the world.
	 *
	 * @param {object} mapDefinition JSON from Tiled map editor.
	 */
	constructor(mapDefinition, player = null, tileSetName, mapName) {
		const sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(tileSetName),
			Tile.SIZE,
			Tile.SIZE
		);

		this.mapNPCs = [];
		this.mapObjects = [];

		this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
		this.collisionLayer = new Layer(mapDefinition.layers[Layer.COLLISION], sprites);
		this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
		this.player = player;

		npcs.get(mapName).forEach((npc) => {
			this.mapNPCs.push(NPCFactory.createInstance(npc.character, npc, this));
		});

		objects.get(mapName).forEach((object) => {
			this.mapObjects.push(ObjectFactory.createInstance(object.type, object));
		});

		if (this.player) {
			this.player.map = this;
		}

		this.renderQueue = this.buildEntityRenderQueue();
	}

	update(dt) {
		this.renderQueue = this.buildEntityRenderQueue();
		this.player.update(dt);
		if (this.mapNPCs.length > 0)
			this.mapNPCs.forEach((npc) => {
				npc.update(dt);
			});
	}

	render() {
		// We now pass in the player object since it is the
		// focal point of the map

		this.bottomLayer.render(this.player);
		this.collisionLayer.render(this.player);

		this.renderQueue.forEach((entity) => {
			entity.render(this.player);
		});

		this.topLayer.render(this.player);

		if (DEBUG) {
			Map.renderGrid();
		}
	}

	// Copied and altered from zelda assignment

	/**
	 * Order the entities by their renderPriority fields. If the renderPriority
	 * is the same, then sort the entities by their bottom positions. This will
	 * put them in an order such that entities higher on the screen will appear
	 * behind entities that are lower down.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
	 *
	 * The spread operator (...) returns all the elements of an array separately
	 * so that you can pass them into functions or create new arrays. What we're
	 * doing below is combining both the entities and objects arrays into one.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
	 */
	buildEntityRenderQueue() {
		// if (!this.player) return [];

		return [...this.mapNPCs, this.player]
			.filter((e) => e !== null)
			.sort((a, b) => {
				let order = 0;
				const bottomA = a.position.y + a.dimensions.y;
				const bottomB = b.position.y + b.dimensions.y;

				if (a.renderPriority < b.renderPriority) {
					order = -1;
				} else if (a.renderPriority > b.renderPriority) {
					order = 1;
				} else if (bottomA < bottomB) {
					order = -1;
				} else {
					order = 1;
				}

				return order;
			});
	}

	/**
	 * Draws a grid of squares on the screen to help with debugging.
	 */
	static renderGrid() {
		context.save();
		context.strokeStyle = Colour.White;

		for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
			context.beginPath();
			context.moveTo(0, y * Tile.SIZE);
			context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
			context.closePath();
			context.stroke();

			for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
				context.beginPath();
				context.moveTo(x * Tile.SIZE, 0);
				context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
				context.closePath();
				context.stroke();
			}
		}

		context.restore();
	}

	/**
	 * Saves and changes the tile sprite of the closed door to an open door
	 * @param {number} x
	 * @param {number} y
	 */
	openDoor(x, y) {
		sounds.play(SoundName.DoorEnter);
		this.doorX = x;
		this.doorY = y;
		this.collisionLayer.getTile(x, y).id = Tile.DOOR_OPEN;
	}

	/**
	 * Closes the door from the previously assigned door coordinates
	 * @param {number} x
	 * @param {number} y
	 */
	closedDoor() {
		this.collisionLayer.getTile(this.doorX, this.doorY).id = Tile.DOOR_CLOSED;
		sounds.play(SoundName.DoorEnter);
	}
}
