import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { stateStack, images, timer, sounds } from "../globals.js";
import EquipmentFactory from "../services/EquipmentFactory.js";
import ChestMenuState from "../states/game/exploring/ChestMenuState.js";
import Equipment from "./equipment/Equipment.js";
import GameObject from "./GameObject.js";

const CHEST_WIDTH = 16;
const CHEST_HEIGHT = 16;

export default class Chest extends GameObject {
	constructor(chestDefinition) {
		super(chestDefinition.dimensions, chestDefinition.position);

		// Sets the two animations that will be used for the chest
		this.animations = {
			closed: new Animation(this.initializeSprites(ImageName.ChestClosed), 0.1),
			opening: new Animation(this.initializeSprites(ImageName.ChestOpening), 0.1, 1),
		};
		this.currentAnimation = this.animations.closed;

		// Gets the items from the definition
		this.items = this.initializeItems(chestDefinition.items) ?? [];
		this.isOpened = false;

		// Gets the sprites for the chest
		this.sprites = this.initializeSprites(ImageName.ChestClosed);
		this.player = null;
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

		super.render(x, y, cameraEntity);
	}

	interact(player) {
		if (!this.isOpened) {
			this.sprites = this.animations.opening.frames;
			this.currentAnimation = this.animations.opening;
			sounds.play(SoundName.Sparkle);
			timer.wait(0.5, () => {
				this.isOpened = true;
				stateStack.push(new ChestMenuState(player, this.items));
			});
		} else {
			stateStack.push(new ChestMenuState(player, this.items));
		}
	}

	initializeSprites(animation) {
		return Sprite.generateSpritesFromSpriteSheet(
			images.get(animation),
			CHEST_WIDTH,
			CHEST_HEIGHT
		);
	}

	/**
	 * Returns a list of equipment created using the json definition
	 * @param {Object} itemDefinitions All the items inside of a chest
	 * @returns
	 */
	initializeItems(itemDefinitions) {
		return itemDefinitions.map((item) => EquipmentFactory.createInstance(item));
	}
}
