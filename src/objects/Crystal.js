import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { stateStack, images } from "../globals.js";
import ChestMenuState from "../states/game/exploring/ChestMenuState.js";
import SaveState from "../states/game/exploring/SaveStateMenu.js";
import GameObject from "./GameObject.js";

const CHEST_WIDTH = 16;
const CHEST_HEIGHT = 16;

export default class SaveCrystal extends GameObject {
	constructor(chestDefinition) {
		super(chestDefinition.dimensions, chestDefinition.position);

		// Gets the sprites for the chest

		this.sprites = this.initializeSprites(ImageName.Crystal);

		// Sets the two animations that will be used for the chest
		this.animations = {
			floating: new Animation(this.sprites, 0.15),
		};
		this.currentAnimation = this.animations.floating;

		this.isOpened = false;
	}

	update(dt) {
		super.update(dt);
		this.currentAnimation.update(dt);

		this.currentFrame = this.currentAnimation.currentFrame;
	}

	render(cameraEntity) {
		const x = Math.floor(this.canvasPosition.x);

		/**
		 * Offset the Y coordinate to provide a more "accurate" visual.
		 * To see the difference, remove the offset and bump into something
		 * either above or below the character and you'll see why this is here.
		 */
		const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

		super.render(x, y, cameraEntity, { x: 2, y: 2 });
	}

	interact(player) {
		stateStack.push(new SaveState(player));
	}

	initializeSprites(animation) {
		return Sprite.generateSpritesFromSpriteSheet(
			images.get(animation),
			CHEST_WIDTH,
			CHEST_HEIGHT
		);
	}
}
