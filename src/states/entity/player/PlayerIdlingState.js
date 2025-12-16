import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/entities/state/PlayerStateName.js";
import { input, sounds, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";
import InventoryState from "../../game/exploring/InventoryState.js";
import SoundName from "../../../enums/SoundName.js";

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
			[Direction.Up]: new Animation(this.player.idleSprites[0], 0.1),
			[Direction.Down]: new Animation(this.player.idleSprites[1], 0.1),
			[Direction.Left]: new Animation(this.player.idleSprites[2], 0.1),
			[Direction.Right]: new Animation(this.player.idleSprites[3], 0.1),
		};
	}

	enter() {
		this.player.sprites = this.player.idleSprites[this.player.direction];
		this.player.currentAnimation = this.animation[this.player.direction];
	}

	update() {
		this.player.sprites = this.player.idleSprites[this.player.direction];

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

	/**
	 * Interacts with an NPC or object in front of the player
	 * @returns if enter jey has not been pressed
	 */
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
			sounds.play(SoundName.MenuOpen);
			stateStack.push(new InventoryState(this.player));
		}
	}
}
