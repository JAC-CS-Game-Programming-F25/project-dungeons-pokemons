import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import Menu from "../../../user-interface/elements/Menu.js";
import { stateStack } from "../../../globals.js";

export default class SaveState extends State {
	constructor(player) {
		super();

		this.player = player;

		// Create menu items from the Pokémon's moves
		// Always create 4 slots, fill empty ones with dashes
		const items = [
			{ text: "Save", onSelect: () => this.save() },
			{ text: "Exit", onSelect: () => this.exitMenu() },
		];

		this.moveGrid = new Menu(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			items
		);
	}

	update() {
		this.moveGrid.update();
	}

	render() {
		this.moveGrid.render();
	}

	// Handles selecting an item from the chest
	save() {
		localStorage.setItem(
			"playerData",
			JSON.stringify({
				position: this.player.position,
				inventory: this.player.inventory,
				direction: this.player.direction,
			})
		);
		stateStack.pop();
	}

	exitMenu() {
		stateStack.pop();
	}
}
