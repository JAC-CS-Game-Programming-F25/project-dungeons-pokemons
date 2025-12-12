import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/entities/state/PlayerStateName.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";
import InventoryState from "../../game/exploring/InventoryState.js";

export default class PlayerIdlingState extends State {
	/**
	 * In this state, the player is stationary unless
	 * a directional key or the spacebar is pressed.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.animation = {
			[Direction.Up]: new Animation([12], 1),
			[Direction.Down]: new Animation([0], 1),
			[Direction.Left]: new Animation([4], 1),
			[Direction.Right]: new Animation([8], 1),
		};
	}

	enter() {
		this.player.currentAnimation = this.animation[this.player.direction];
	}

	update() {
		if (input.isKeyHeld(Input.KEYS.S)) {
			this.player.direction = Direction.Down;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyHeld(Input.KEYS.D)) {
			this.player.direction = Direction.Right;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyHeld(Input.KEYS.W)) {
			this.player.direction = Direction.Up;
			this.player.changeState(PlayerStateName.Walking);
		} else if (input.isKeyHeld(Input.KEYS.A)) {
			this.player.direction = Direction.Left;
			this.player.changeState(PlayerStateName.Walking);
		}

		this.interact();
		this.checkInventory();
	}

	/**
	 * Checks whether there is an npc on the tile beside the player is facing
	 */
	interactWithNPC() {
		if (!input.isKeyPressed(Input.KEYS.ENTER)) return;

		let x = this.player.position.x;
		let y = this.player.position.y;

		switch (this.player.direction) {
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
	}

	interact() {
		if (!input.isKeyPressed(Input.KEYS.ENTER)) return;

		let x = this.player.position.x;
		let y = this.player.position.y;

		switch (this.player.direction) {
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

		const npc = this.player.map.mapNPCs.find(
			(npc) => npc.position.x === x && npc.position.y === y
		);

		if (npc) {
			npc.dialogue(this.player.direction);
		}

		const object = this.player.map.mapObjects.find(
			(obj) => obj.position.x === x && obj.position.y === y
		);

		if (object) {
			object.interact(this.player);
		}
	}

	checkInventory() {
		if (input.isKeyPressed(Input.KEYS.I)) {
			stateStack.push(new InventoryState(this.player));
		}
	}
}
