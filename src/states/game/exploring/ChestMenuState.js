import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";

export default class ChestMenuState extends State {
	constructor(player, chestContents) {
		super();

		this.player = player;

		// Create menu items from the Pokémon's moves
		// Always create 4 slots, fill empty ones with dashes
		this.items = [];

		this.initializeItems(chestContents);

		this.moveGrid = new GridSelection(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
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

	initializeItems(chestContents) {
		const itemsPerPage = 6; // 2 columns x 3 rows

		// Process all chest contents
		for (let i = 0; i < chestContents.length; i++) {
			const item = chestContents[i];

			// Puts item only if it has not been taken yet
			if (!item.taken) {
				this.items.push({
					text: item.name,
					onSelect: () => this.selectItem(i, item),
				});
			}
		}

		// Calculate how many slots we need to fill the last page
		const totalPages = Math.ceil(this.items.length / itemsPerPage); // rounds to the highest closest integer (ex: if ans = 0.8 returns 1)
		const totalSlotsNeeded = totalPages * itemsPerPage;
		const emptySlots = totalSlotsNeeded - this.items.length; // calculates the amount of empty slots

		// Fill remaining slots with empty placeholders
		for (let i = 0; i < emptySlots; i++) {
			this.items.push({
				text: "-",
				onSelect: null,
			});
		}
	}

	// Handles selecting an item from the chest
	selectItem(index, item) {
		this.player.inventory.push(item);

		for (let i = 0; i < this.moveGrid.items.length; i++) {
			if (i === index) {
				this.moveGrid.items[i].text = "-";
				this.moveGrid.items[i].onSelect = null;
				item.taken = true;
			}
		}
	}
}
