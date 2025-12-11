import Animation from "../../../../lib/Animation.js";
import {
	didSucceedPercentChance,
	getRandomPositiveInteger,
	pickRandomElement,
} from "../../../../lib/Random.js";
import State from "../../../../lib/State.js";
import NPC from "../../../entities/NPC.js";
import Direction from "../../../enums/Direction.js";
import NpcStateName from "../../../enums/NpcStateName.js";
import { timer } from "../../../globals.js";
import Tile from "../../../services/Tile.js";
import Easing from "../../../../lib/Easing.js";

export default class NpcWalkingState extends State {
	static IDLE_CHANCE = 0.5;
	static MOVE_DURATION_MIN = 2;
	static MOVE_DURATION_MAX = 6;

	/**
	 * In this state, the npc moves around in random
	 * valid direction.
	 *
	 * @param {NPC} npc
	 * @param {Animation} animation
	 */
	constructor(npc, animation) {
		super();

		this.npc = npc;
		this.bottomLayer = this.npc.map.bottomLayer;
		this.collisionLayer = this.npc.map.collisionLayer;
		this.animation = animation;
	}

	enter() {
		this.decideDirection();
	}

	update(dt) {
		this.npc.currentAnimation = this.animation[this.npc.direction];

		if (this.isMoving) {
			return;
		}

		this.move(dt);
	}

	/**
	 * 25% chance for the npc to move in any direction.
	 */
	decideDirection() {
		this.npc.direction = pickRandomElement([
			Direction.Up,
			Direction.Down,
			Direction.Left,
			Direction.Right,
		]);
		this.npc.currentAnimation = this.animation[this.npc.direction];
	}

	move() {
		let x = this.npc.position.x;
		let y = this.npc.position.y;

		switch (this.npc.direction) {
			case Direction.Up:
				y--;
				break;
			case Direction.Down:
				y++;
				break;
			case Direction.Left:
				x--;
				break;
			case Direction.Right:
				x++;
				break;
		}

		if (!this.isValidMove(x, y)) {
			this.decideDirection();
			return;
		}

		this.npc.position.x = x;
		this.npc.position.y = y;

		this.tweenMovement(x, y);
	}

	tweenMovement(x, y) {
		this.isMoving = true;

		timer.tween(
			this.npc.canvasPosition,
			{ x: x * Tile.SIZE, y: y * Tile.SIZE },
			0.25,
			Easing.linear,
			() => {
				this.isMoving = false;
				this.npc.changeState(NpcStateName.Idle);
			}
		);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns Whether the npc is going to move on to a non-collidable tile or the player.
	 */
	isValidMove(x, y) {
		let noPlayer = true;

		if (x === this.npc.map.player.position.x)
			if (y === this.npc.map.player.position.y) noPlayer = false;

		return this.collisionLayer.getTile(x, y) === null && noPlayer;
	}
}
