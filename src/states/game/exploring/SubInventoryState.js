import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import Menu from "../../../user-interface/elements/Menu.js";
import Equipment from "../../../objects/equipment/Equipment.js";
import SubInventoryPanel from "../../../user-interface/exploring/SubInventoryPanel.js";
import InventoryState from "./InventoryState.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";

export default class SubInventoryState extends State {
	/**
	 *
	 * @param {SubInventoryPanel} subInv
	 * @param {InventoryState} inventoryState
	 */
	constructor(subInv, inventoryState) {
		super();

		this.inventoryState = inventoryState;

		this.subInv = subInv;
	}

	update() {
		this.subInv.update();
		if (
			input.isKeyPressed(Input.KEYS.SHIFT_LEFT) ||
			input.isKeyPressed(Input.KEYS.SHIFT_RIGHT)
		) {
			stateStack.pop();
		}
	}

	render() {
		this.inventoryState.render();
	}

	// // Fills the menu with items from the chest, adding dashes if less than 4

	// /**
	//  * Initialises all the equipment the player owns
	//  * @param {Equipment[]} inventory
	//  */
	// initializeItems(inventory, callback) {
	// 	for (let i = 0; i < 4; i++) {
	// 		// Makes sure we don't go out of bounds
	// 		if (i < inventory.length) {
	// 			const item = inventory[i];

	// 			// Puts item only if it has not been taken yet
	// 			this.items.push({
	// 				text: item.name,
	// 				onSelect: () => callback(),
	// 			});
	// 		} else {
	// 			this.items.push({
	// 				text: "-",
	// 				onSelect: null,
	// 			});
	// 		}
	// 	}
	// }

	// /**
	//  * Handles selecting an item from the inventory
	//  * @param {number} index
	//  * @param {Equipment} item
	//  * @returns
	//  */
	// selectItem(index, item) {
	// 	for (let i = 0; i < this.moveGrid.selection.items.length; i++) {
	// 		if (i === index) {
	// 			item.useEffect();
	// 			this.moveGrid.selection.items[i].text = "-";
	// 			this.moveGrid.selection.items[i].onSelect = null;
	// 			return;
	// 		}
	// 	}
	// }
}
