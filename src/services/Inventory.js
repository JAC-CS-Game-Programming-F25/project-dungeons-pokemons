import EquipmentName from "../enums/EquipmentName.js";
import Equipment from "../objects/equipment/Equipment.js";

export default class Inventory {
	/**
	 *
	 * @param {Equipment[]} inventoryDefinition
	 */
	constructor(inventoryDefinition = []) {
		this.armors = [];
		this.weapons = [];
		this.keyItems = [];
		this.items = [];

		if (inventoryDefinition.length > 0) {
			inventoryDefinition.forEach((item) => {
				this.Add(item);
			});
		}
	}

	Add(item) {
		switch (item.type) {
			case EquipmentName.Weapon:
				this.weapons.push(item);
				break;
			case EquipmentName.Armor:
				this.armors.push(item);
				break;
			case EquipmentName.KeyItem:
				this.keyItems.push(item);
				break;
			default:
				this.items.push(item);
				break;
		}
	}

	Remove(index, item) {
		switch (item.type) {
			case EquipmentName.Weapon:
				this.weapons.splice(index, 1);
				break;
			case EquipmentName.Armor:
				this.armors.splice(index, 1);
				break;
			case EquipmentName.KeyItem:
				this.keyItems.splice(index, 1);
				break;
			default:
				this.items.splice(index, 1);
				break;
		}
	}
}
