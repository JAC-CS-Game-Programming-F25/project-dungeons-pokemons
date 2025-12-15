import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import Panel from "../elements/Panel.js";
import Player from "../../entities/Player.js";
import Selection from "../elements/Selection.js";
import Menu from "../elements/Menu.js";
import GridSelection from "../elements/GridSelections.js";

export default class InventoryPanel extends Panel {
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
		this.subMenuInUse = false;
		this.firstSubMenu = undefined;
		this.naveBar = new Selection(1, 1, 1, 1, [
			{
				text: "Items",
				onSelect: () => {
					this.subMenuInUse = true;
					// Selects the subinventory as the state
				},
			},
			{
				text: "Armor",
				onSelect: () => {
					this.subMenuInUse = true;
					// Selects the subinventory as the state
				},
			},
			{
				text: "Weapons",
				onSelect: () => {
					this.subMenuInUse = true;
					// Selects the subinventory as the state
				},
			},
			{
				text: "Key Items",
				onSelect: () => {
					this.subMenuInUse = true;
					// Selects the subinventory as the state
				},
			},
		]);

		this.itemsSubMenu = new GridSelection(1, 1, 1, 1, this.player.inventory.items);
		this.keyItemSubMenu = new GridSelection(1, 1, 1, 1, this.player.inventory.keyItems);
	}

	update() {
		if (!this.subMenuInUse) this.naveBar.update();
	}

	render() {
		super.render();

		this.naveBar.render();
		switch (this.naveBar.currentSelection) {
			case 0: {
				this.itemsSubMenu.render();
				break;
			}
			case 1: {
				this.renderArmors();
				break;
			}
			case 2: {
				this.renderWeapons();
				break;
			}
			case 3: {
				this.keyItemSubMenu.render();
				break;
			}
		}
	}

	/**
	 * All the magic number offsets here are to
	 * arrange all the pieces nicely in the space.
	 */
	renderStatistics() {
		context.save();
		context.textBaseline = "top";
		context.fillStyle = Colour.Black;
		context.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		context.fillText(
			this.pokemon.name.toUpperCase(),
			this.position.x + 15,
			this.position.y + 12
		);
		context.textAlign = "right";
		context.fillText(
			`Lv${this.pokemon.level}`,
			this.position.x + this.dimensions.x - 10,
			this.position.y + 12
		);
		context.fillText(
			`HP: ${this.pokemon.getHealthMeter()}`,
			this.position.x + this.dimensions.x - 30,
			this.position.y + this.dimensions.y - 50
		);
		context.fillText(
			`EXP: ${this.pokemon.getExperienceMeter()}`,
			this.position.x + this.dimensions.x - 30,
			this.position.y + this.dimensions.y - 25
		);
		context.restore();
	}
}
