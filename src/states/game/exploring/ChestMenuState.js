import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";

export default class ChestMenuState extends State {
	constructor(player, chestContents) {
		super();

		this.player = player;

		// Create menu items from the Pokémon's moves
		// Always create 4 slots, fill empty ones with dashes
		this.items = [];

		this.initializeItems(chestContents);

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

	initializeItems(chestContents) {
		for (let i = 0; i < 4; i++) {
			// Makes sure we don't go out of bounds
			if (i < chestContents.length) {
				const item = chestContents[i];

				// Puts item only if it has not been taken yet
				if (!item.taken)
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

	// Handles selecting an item from the chest
	selectItem(index, item) {
		this.player.inventory.push(item);

		for (let i = 0; i < this.contentView.items.length; i++) {
			if (i === index) {
				this.contentView.items[i].text = "-";
				this.contentView.items[i].onSelect = null;
				chestContents[i].taken = true;
			}
		}
	}
}
