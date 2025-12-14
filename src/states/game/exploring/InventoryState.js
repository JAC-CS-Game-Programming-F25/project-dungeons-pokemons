import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import Menu from "../../../user-interface/elements/Menu.js";
import Equipment from "../../../objects/equipment/Equipment.js";

export default class InventoryState extends State {
	constructor(player) {
		super();

		this.player = player;

		// Create menu items from the Pokémon's moves
		// Always create 4 slots, fill empty ones with dashes
		this.items = [];

		this.initializeItems(this.player.inventory);

		this.moveGrid = new Menu(
			Panel.POKEMON_STATS.x,
			Panel.POKEMON_STATS.y,
			Panel.POKEMON_STATS.width,
			Panel.POKEMON_STATS.height,
			this.items
		);
	}

	update() {
		this.moveGrid.update();
	}

	render() {
		this.moveGrid.render();
	}

	// Fills the menu with items from the chest, adding dashes if less than 4

	/**
	 * Initialises all the equipment the player owns
	 * @param {Equipment[]} inventory
	 */
	initializeItems(inventory) {
		for (let i = 0; i < 4; i++) {
			// Makes sure we don't go out of bounds
			if (i < inventory.length) {
				const item = inventory[i];

				// Puts item only if it has not been taken yet
				this.items.push({
					text: item.name,
					onSelect: () => this.selectItem(i, item),
				});
			} else {
				this.items.push({
					text: "-",
					onSelect: null,
				});
			}
		}
	}

	/**
	 * Handles selecting an item from the inventory
	 * @param {number} index
	 * @param {Equipment} item
	 * @returns
	 */
	selectItem(index, item) {
		for (let i = 0; i < this.moveGrid.selection.items.length; i++) {
			if (i === index) {
				item.useEffect();
				this.moveGrid.selection.items[i].text = "-";
				this.moveGrid.selection.items[i].onSelect = null;
				return;
			}
		}
	}
}
