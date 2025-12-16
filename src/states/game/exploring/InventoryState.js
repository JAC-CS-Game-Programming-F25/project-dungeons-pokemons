import State from "../../../../lib/State.js";
import Panel from "../../../user-interface/elements/Panel.js";
import Menu from "../../../user-interface/elements/Menu.js";
import { input, stateStack } from "../../../globals.js";
import Input from "../../../../lib/Input.js";
import Equipment from "../../../objects/equipment/Equipment.js";
import InventoryPanel from "../../../user-interface/exploring/InventoryPanel.js";
import SubInventoryPanel from "../../../user-interface/exploring/SubInventoryPanel.js";
import SubInventoryState from "./SubInventoryState.js";
import Player from "../../../entities/Player.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import EquipmentName from "../../../enums/EquipmentName.js";

export default class InventoryState extends State {
	/**
	 * Inventory of the player
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;

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
			"Stats",
			this.initializeItems(player.inventory.armors),
			{ text: "Defense", value: player.defense ?? 2 },
			{ text: player.equippedArmor.name }
		);
		this.weaponSubMenu = new SubInventoryPanel(
			1,
			2.5,
			13,
			7.5,
			"Stats",
			this.initializeItems(player.inventory.weapons),
			{ text: "Attack", value: player.attack ?? 2 },
			{ text: player.equippedWeapon.name }
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
			if (item.type === EquipmentName.Armor || item.type === EquipmentName.Weapon)
				items.push({
					text: item.name,
					value: item.value,
					onSelect: () => this.swapItem(i, inventory),
				});
			else
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

	/**
	 *
	 * @param {number} index
	 * @param {Equipment[]} subInv
	 * @returns
	 */
	swapItem(index, subInv) {
		const temp = { ...subInv[index] };
		let subMenu = null;

		if (subInv[index].type === EquipmentName.Weapon) subMenu = this.weaponSubMenu;
		else subMenu = this.armorSubMenu;

		for (let i = 0; i < subInv.length; i++) {
			if (i === index) {
				if (subInv[index].type === EquipmentName.Weapon) {
					subInv[index] = { ...this.player.equippedWeapon };
					this.player.equippedWeapon = { ...temp };
					subMenu.infoPanel.currentEquipment.text = this.player.equippedWeapon.name;
					this.player.calculateStats();
					subMenu.infoPanel.items.value = this.player.attackBack;
				} else if (subInv[index].type === EquipmentName.Armor) {
					subInv[index] = { ...this.player.equippedArmor };
					this.player.equippedArmor = { ...temp };
					subMenu.infoPanel.currentEquipment.text = this.player.equippedArmor.name;
					this.player.calculateStats();
					subMenu.infoPanel.items.value = this.player.defense;
				}

				subMenu.itemsSubMenu.selection.items[i].text = subInv[index].name;
				subMenu.itemsSubMenu.selection.items[i].onSelect = () => this.swapItem(i, subInv);
				this.player.calculateStats();
				return;
			}
		}
	}
}
