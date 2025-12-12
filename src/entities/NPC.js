import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import GameEntity from "./GameEntity.js";
import StateMachine from "../../lib/StateMachine.js";
import Vector from "../../lib/Vector.js";
import NpcStateName from "../enums/entities/state/NpcStateName.js";
import NpcIdlingState from "../states/entity/npc/NpcIdlingState.js";
import NpcWalkingState from "../states/entity/npc/NpcWalkingState.js";
import { images } from "../globals.js";
import Direction from "../enums/Direction.js";

export default class NPC extends GameEntity {
	constructor(entityDefinition, map, walkAnimation, idleAnimation) {
		super(entityDefinition);

		this.map = map;
		this.walkingAnimation = walkAnimation;
		this.idleAnimation = idleAnimation;
		this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);
		this.stateMachine = this.initializeStateMachine();
		this.sprites = this.initializeSprites(
			entityDefinition.totalSprites,
			entityDefinition.firstSprite
		);
		this.currentAnimation = this.stateMachine.currentState.animation[this.direction];
	}

	update(dt) {
		super.update(dt);
		this.currentAnimation.update(dt);

		this.currentFrame = this.currentAnimation.getCurrentFrame();
	}

	render(cameraEntity) {
		const x = Math.floor(this.canvasPosition.x);

		/**
		 * Offset the Y coordinate to provide a more "accurate" visual.
		 * To see the difference, remove the offset and bump into something
		 * either above or below the character and you'll see why this is here.
		 */
		const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

		super.render(x, y, cameraEntity);
	}

	initializeStateMachine() {
		const stateMachine = new StateMachine();

		// Used to see if the npc is has a walking state or not
		let willMove = true;

		if (this.walkingAnimation)
			stateMachine.add(NpcStateName.Moving, new NpcWalkingState(this, this.walkingAnimation));
		else willMove = false;

		stateMachine.add(NpcStateName.Idle, new NpcIdlingState(this, this.idleAnimation, willMove));

		stateMachine.change(NpcStateName.Idle);

		return stateMachine;
	}

	/**
	 * This gets the exact number of sprites and the first sprite of an npc and calculates the position of each of its sprite
	 * and creates sprite objects out of them. Took a bit to figure this out
	 */
	initializeSprites(numOfSprites, firstSprite) {
		this.sprites.push(
			new Sprite(
				images.get(ImageName.Npcs),
				firstSprite.x,
				firstSprite.y,
				GameEntity.WIDTH,
				GameEntity.HEIGHT
			)
		);

		let temp = [];

		for (let i = 1; i < numOfSprites; i++) {
			temp.push({
				x: firstSprite.x + (GameEntity.WIDTH * i + 2 * i),
				y: firstSprite.y,
				width: GameEntity.WIDTH,
				height: GameEntity.HEIGHT,
			});
		}

		return [...this.sprites, ...Sprite.generateSprites(temp, ImageName.Npcs)];
	}

	/**
	 * This is how the dialogue is displayed, it also changes the direction of the npc so it faces the player.
	 * @param {Direction} playerDirection
	 */
	dialogue(playerDirection) {
		switch (playerDirection) {
			case Direction.Up:
				this.direction = Direction.Down;
				break;
			case Direction.Down:
				this.direction = Direction.Up;
				break;
			case Direction.Left:
				this.direction = Direction.Right;
				break;
			case Direction.Right:
				this.direction = Direction.Left;
				break;
		}

		this.currentAnimation = this.stateMachine.currentState.animation[this.direction];
	}
}
