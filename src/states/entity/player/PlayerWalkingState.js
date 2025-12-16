import Animation from "../../../../lib/Animation.js";
import { didSucceedPercentChance } from "../../../../lib/Random.js";
import State from "../../../../lib/State.js";
import Opponent from "../../../entities/Opponent.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/entities/state/PlayerStateName.js";
import SoundName from "../../../enums/SoundName.js";
import Input from "../../../../lib/Input.js";
import { input, sounds, stateStack, timer, maps } from "../../../globals.js";
import Tile from "../../../services/Tile.js";
import BattleState from "../../game/battle/BattleState.js";
import BuildingState from "../../game/BuildingState.js";
import TransitionState from "../../game/TransitionState.js";
import Easing from "../../../../lib/Easing.js";
import ImageName from "../../../enums/ImageName.js";
import Map from "../../../services/Map.js";
import { Maps } from "../../../enums/MapNames.js";

export default class PlayerWalkingState extends State {
	static ENCOUNTER_CHANCE = 0.075;

	/**
	 * In this state, the player can move around using the
	 * directional keys. From here, the player can go idle
	 * if no keys are being pressed.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.bottomLayer = this.player.map.bottomLayer;
		this.collisionLayer = this.player.map.collisionLayer;
		this.animation = {
			[Direction.Up]: new Animation(this.player.walkingSprites[0], 0.1),
			[Direction.Down]: new Animation(this.player.walkingSprites[1], 0.1),
			[Direction.Left]: new Animation(this.player.walkingSprites[2], 0.1),
			[Direction.Right]: new Animation(this.player.walkingSprites[3], 0.1),
		};

		this.isMoving = false;
		this.stepped = false;
		this.inBattle = false;
	}

	enter() {
		this.player.sprites = this.player.walkingSprites[this.player.direction];
		this.bottomLayer = this.player.map.bottomLayer;
		this.collisionLayer = this.player.map.collisionLayer;
	}

	update(dt) {
		this.player.sprites = this.player.walkingSprites[this.player.direction];
		this.player.currentAnimation = this.animation[this.player.direction];

		this.handleMovement();
	}

	handleMovement() {
		/**
		 * Unlike Zelda, the Player's movement in Pokemon is locked to
		 * the grid. To restrict them from moving freely, we set a flag
		 * to track if they're currently moving from one tile to another,
		 * and reject input if so.
		 */
		if (this.isMoving) {
			return;
		}

		if (
			!input.isKeyHeld(Input.KEYS.W) &&
			!input.isKeyHeld(Input.KEYS.A) &&
			!input.isKeyHeld(Input.KEYS.S) &&
			!input.isKeyHeld(Input.KEYS.D)
		) {
			this.player.changeState(PlayerStateName.Idling);
			return;
		}

		this.updateDirection();
		this.move();
	}

	updateDirection() {
		if (input.isKeyHeld(Input.KEYS.S)) {
			this.player.direction = Direction.Down;
		} else if (input.isKeyHeld(Input.KEYS.D)) {
			this.player.direction = Direction.Right;
		} else if (input.isKeyHeld(Input.KEYS.W)) {
			this.player.direction = Direction.Up;
		} else if (input.isKeyHeld(Input.KEYS.A)) {
			this.player.direction = Direction.Left;
		}
	}

	move() {
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

		if (!this.checkCollisions(x, y)) {
			sounds.play(SoundName.PlayerBump);
			return;
		}

		// I check for any door collision after I check that I hit something on the collision layer
		if (!this.isValidMove(x, y)) {
			sounds.play(SoundName.PlayerBump);
			return;
		}

		this.player.position.x = x;
		this.player.position.y = y;

		this.tweenMovement(x, y);
	}

	tweenMovement(x, y) {
		this.isMoving = true;

		this.stepped = !this.stepped;
		sounds.play(this.stepped ? SoundName.Step2 : SoundName.Step1);

		timer.tween(
			this.player.canvasPosition,
			{ x: x * Tile.SIZE, y: y * Tile.SIZE },
			0.25,
			Easing.linear,
			() => {
				this.isMoving = false;

				this.updateDirection();

				if (this.checkForEncounter(x, y)) {
					this.startEncounter();
				}
			}
		);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns Whether the player is going to move on to a non-collidable tile.
	 */
	isValidMove(x, y) {
		return this.collisionLayer.getTile(x, y) === null;
	}

	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns Whether the player is going to move on to an npc.
	 */
	checkCollisions(x, y) {
		let noCollision = true;

		this.player.map.mapNPCs.forEach((npc) => {
			if (x === npc.position.x)
				if (y === npc.position.y) {
					noCollision = false;
					return;
				}
		});

		this.player.map.mapObjects.forEach((object) => {
			if (x === object.position.x)
				if (y === object.position.y) {
					noCollision = false;
					return;
				}
		});

		return noCollision;
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns Whether player is going to move to a grass tile. Succeeds 10% of the time.
	 */
	checkForEncounter(x, y) {
		return didSucceedPercentChance(PlayerWalkingState.ENCOUNTER_CHANCE) && !this.inBattle;
	}

	/**
	 * Starts the encounter by doing a fade transition into a new BattleState.
	 */
	startEncounter() {
		this.inBattle = true;
		const encounter = new BattleState(this.player, new Opponent());

		timer.wait(0.5, () => {
			sounds.stop(SoundName.Route);
			sounds.play(SoundName.BattleLoop);
			TransitionState.fade(() => {
				stateStack.push(encounter);
				this.inBattle = false;
			});
		});
	}
}
