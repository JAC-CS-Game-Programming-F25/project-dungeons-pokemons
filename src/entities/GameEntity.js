import Direction from "../enums/Direction.js";
import Tile from "../services/Tile.js";
import Vector from "../../lib/Vector.js";
import { OFFSET_X, OFFSET_Y } from "../globals.js";

export default class GameEntity {
	static WIDTH = 16;
	static HEIGHT = 16;

	/**
	 * The base class to be extended by all entities in the game.
	 * Right now we just have one Player character, but this could
	 * be extended to implement NPCs (Non Player Characters) as well.
	 *
	 * @param {object} entityDefinition
	 */
	constructor(entityDefinition = {}) {
		this.position = entityDefinition.position ?? new Vector();
		this.canvasPosition = new Vector(
			Math.floor(this.position.x * Tile.SIZE),
			Math.floor(this.position.y * Tile.SIZE)
		);
		this.dimensions = entityDefinition.dimensions ?? new Vector();
		this.direction = entityDefinition.direction ?? Direction.Down;
		this.stateMachine = null;
		this.currentFrame = 0;
		this.sprites = [];

		// Added render priority for render queue
		this.renderPriority = 0;
	}

	/**
	 * At this time, stateMachine will be null for Pokemon.
	 */
	update(dt) {
		this.stateMachine?.update(dt);
	}

	/**
	 *
	 * Renders the entity relative to the cameraEntity to simulate
	 * a camera following effect.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {GameEntity} cameraEntity
	 */
	render(x, y, cameraEntity = null, scale = { x: 1, y: 1 }) {
		this.stateMachine?.render();

		if (cameraEntity !== null)
			this.sprites[this.currentFrame].render(
				x + OFFSET_X * Tile.SIZE - cameraEntity.canvasPosition.x,
				y + OFFSET_Y * Tile.SIZE - cameraEntity.canvasPosition.y
			);
		else this.sprites[this.currentFrame].render(x, y, scale);
	}

	changeState(state, params) {
		this.stateMachine?.change(state, params);
	}

	attackAnimation(callback) {}
}
