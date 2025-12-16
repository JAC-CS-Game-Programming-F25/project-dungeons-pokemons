import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";
import BattleTurnState from "./BattleTurnState.js";
import BattleMessageState from "./BattleMessageState.js";

export default class BattleInventoryMenuState extends State {
	constructor(player, inventory, battleState) {
		super();

		this.player = player;

		// Create menu items from the Pokémon's moves
		// Always create 4 slots, fill empty ones with dashes
		this.items = [];

		this.initializeItems(inventory, battleState);

		this.contentView = new GridSelection(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			this.items
		);
	}

	update() {
		this.contentView.update();

		if (
			input.isKeyPressed(Input.KEYS.SHIFT_LEFT) ||
			input.isKeyPressed(Input.KEYS.SHIFT_RIGHT)
		) {
			stateStack.pop();
		}
	}

	render() {
		this.contentView.render();
	}

	// Fills the menu with items from the chest, adding dashes if less than 4

	initializeItems(inventory, battleState) {
		const itemsPerPage = 6; // 2 columns x 3 rows

		// Process all chest contents
		for (let i = 0; i < inventory.length; i++) {
			const item = inventory[i];

			// Puts item only if it has not been taken yet
			if (!item.taken) {
				this.items.push({
					text: item.name,
					onSelect: () => {
						this.selectItem(i);
						stateStack.pop();
						stateStack.pop();
						stateStack.push(
							new BattleMessageState(`You used a ${item.text}!`, 1, () => {
								stateStack.push(new BattleTurnState(battleState));
							})
						);
					},
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

	// Handles selecting an item from the inventory
	selectItem(index) {
		for (let i = 0; i < this.contentView.items.length; i++) {
			if (i === index) {
				this.contentView.items[i].text = "-";
				this.contentView.items[i].onSelect = null;
				this.player.inventory.splice(index, 1);
			}
		}
	}
}
