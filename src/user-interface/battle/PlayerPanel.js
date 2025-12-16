import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import Panel from "../elements/Panel.js";
import Player from "../../entities/Player.js";
import ProgressBar from "../elements/ProgressBar.js";

export default class BattlePlayerPanel extends Panel {
	/**
	 * The Panel displayed beside the Player's Pokemon
	 * during battle that displays their name, health,
	 * level and experience.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Player} player
	 * @param {object} options Options for the super Panel.
	 */
	constructor(x, y, width, height, player, options = {}) {
		super(x, y, width, height, options);

		this.player = player;

		this.healthBar = new ProgressBar(
			this.position.x + 40,
			this.position.y + this.dimensions.y - 44,
			this.dimensions.x - 60,
			8,
			player.currentHealth,
			player.maxHealth,
			"yellow"
		);

		this.experienceBar = new ProgressBar(
			this.position.x + 17,
			this.position.y + this.dimensions.y - 12,
			this.dimensions.x - 35,
			4,
			player.currentExperience - player.levelExperience,
			player.targetExperience - player.levelExperience,
			"#4287f5"
		);
	}

	render() {
		super.render();

		this.renderStatistics();
		this.healthBar.render();
		this.experienceBar.render();
	}

	/**
	 * All the magic number offsets here are to
	 * arrange all the pieces nicely in the space.
	 */
	renderStatistics() {
		context.save();
		context.textBaseline = "top";
		context.fillStyle = Colour.White;
		context.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		context.fillText(
			this.player.name.toUpperCase(),
			this.position.x + 15,
			this.position.y + 12
		);
		context.textAlign = "right";
		context.fillText(
			`Lv${this.player.level}`,
			this.position.x + this.dimensions.x - 10,
			this.position.y + 12
		);

		// HP Display
		context.textAlign = "left";
		context.fillText(`HP`, this.position.x + 15, this.position.y + this.dimensions.y - 50);

		context.fillText(
			`${this.player.getHealthMeter()}`,
			this.position.x + 80,
			this.position.y + this.dimensions.y - 32
		);

		// context.fillText(
		//   `EXP: ${this.pokemon.getExperienceMeter()}`,
		//   this.position.x + this.dimensions.x - 10,
		//   this.position.y + this.dimensions.y - 25
		// );
		context.restore();
	}
}
