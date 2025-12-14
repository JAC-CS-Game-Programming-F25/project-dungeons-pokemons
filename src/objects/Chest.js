import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { stateStack, images } from "../globals.js";
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
			closed: new Animation(this.initializeSprites(ImageName.ChestClosed), 0.15),
			opening: new Animation(this.initializeSprites(ImageName.ChestOpening), 0.2, 1),
		};
		this.currentAnimation = this.animations.closed;

		// Gets the items from the definition
		this.items = this.initializeItems(chestDefinition.items) ?? [];
		this.isOpened = false;

		// Gets the sprites for the chest
		this.sprites = this.initializeSprites(ImageName.ChestClosed);
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
		stateStack.push(new ChestMenuState(player, this.items));
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
