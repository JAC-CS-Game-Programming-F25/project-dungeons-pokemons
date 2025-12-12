import State from "../../../lib/State.js";
import { stateStack } from "../../globals.js";
import Panel from "../elements/Panel.js";
import BattleState from "./BattleState.js";
import BattleTurnState from "./BattleTurnState.js";
import GridSelection from "../elements/GridSelections.js";

export default class ChestMenu extends State {
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
			items
		);
	}

	update() {
		this.moveGrid.update();
		this.battleState.update();
	}

	render() {
		this.moveGrid.render();
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
						text: item.text,
						onSelect: () => this.selectItem(item),
					});
			} else {
				this.items.push({
					text: "-",
					onSelect: null,
				});
			}
		}
	}

	selectItem(item) {
		item.text = "-";
		item.onSelect = null;
		item.taken = true;
		this.player.inventory.push(item);
	}
}
