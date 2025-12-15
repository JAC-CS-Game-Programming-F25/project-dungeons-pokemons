import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import Menu from "../../../user-interface/elements/Menu.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";
import Equipment from "../../../objects/equipment/Equipment.js";
import InventoryPanel from "../../../user-interface/exploring/InventoryPanel.js";
import SubInventoryPanel from "../../../user-interface/exploring/SubInventoryPanel.js";
import { stateStack } from "../../../globals.js";
import SubInventoryState from "./SubInventoryState.js";
import Player from "../../../entities/Player.js";

export default class InventoryState extends State {
	/**
	 * Inventory of the player
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.itemsSubMenu = new GridSelection(
			1,
			2.5,
			13,
			7.5,
			this.initializeItems(player.inventory.items)
		);
		this.keyItemSubMenu = new GridSelection(
			1,
			2.5,
			13,
			7.5,
			this.initializeItems(player.inventory.keyItems)
		);
		this.armorSubMenu = new SubInventoryPanel(
			1,
			2.5,
			13,
			7.5,
			"Current",
			this.initializeItems(player.inventory.armors),
			[{ text: "Defense", value: player.attack ?? 2 }]
		);
		this.weaponSubMenu = new SubInventoryPanel(
			1,
			2.5,
			13,
			7.5,
			"Current",
			this.initializeItems(player.inventory.weapons),
			[{ text: "Attack", value: player.defense ?? 2 }]
		);

		this.navBarOptions = [
			{
				text: "Items",
				onSelect: () => {
					stateStack.push(new SubInventoryState(this.itemsSubMenu, this));
				},
			},
			{
				text: "Armor",
				onSelect: () => {
					stateStack.push(new SubInventoryState(this.armorSubMenu, this));
				},
			},
			{
				text: "Weapons",
				onSelect: () => {
					stateStack.push(new SubInventoryState(this.weaponSubMenu, this));
				},
			},
			{
				text: "Key",
				onSelect: () => {
					stateStack.push(new SubInventoryState(this.keyItemSubMenu, this));
				},
			},
		];

		this.inventoryPanel = new InventoryPanel(
			1,
			1,
			13,
			9,
			this.navBarOptions,
			this.itemsSubMenu,
			this.armorSubMenu,
			this.weaponSubMenu,
			this.keyItemSubMenu
		);
	}

	update() {
		this.moveGrid.update();
		if (
			input.isKeyPressed(Input.KEYS.SHIFT_LEFT) ||
			input.isKeyPressed(Input.KEYS.SHIFT_RIGHT)
		) {
			stateStack.pop();
		}
		this.inventoryPanel.update();
	}

	render() {
		this.inventoryPanel.render();
	}

	// Fills the menu with items from the chest, adding dashes if less than 4

	/**
	 * Initialises all the equipment the player owns
	 * @param {Equipment[]} inventory
	 */
	initializeItems(inventory) {
		const items = [];
		const itemsPerPage = 6; // 2 columns x 3 rows

		// Process all chest contents
		for (let i = 0; i < inventory.length; i++) {
			const item = inventory[i];

			// Puts item only if it has not been taken yet
			items.push({
				text: item.name,
				value: item.value,
				onSelect: () => this.selectItem(i, item),
			});
		}

		// Calculate how many slots we need to fill the last page
		const totalPages = Math.ceil(items.length / itemsPerPage); // rounds to the highest closest integer (ex: if ans = 0.8 returns 1)
		const totalSlotsNeeded = totalPages <= 0 ? itemsPerPage : totalPages * itemsPerPage;
		const emptySlots = totalSlotsNeeded - items.length; // calculates the amount of empty slots

		// Fill remaining slots with empty placeholders
		for (let i = 0; i < emptySlots; i++) {
			items.push({
				text: "-",
				onSelect: null,
			});
		}

		return items;
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
