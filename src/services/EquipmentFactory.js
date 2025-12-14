import EffectName from "../enums/EffectName.js";
import EquipmentName from "../enums/EquipmentName.js";
import ObjectNames from "../enums/ObjectNames.js";
import Chest from "../objects/Chest.js";
import SaveCrystal from "../objects/Crystal.js";
import Armor from "../objects/equipment/Armor.js";
import Equipment from "../objects/equipment/Equipment.js";
import KeyItem from "../objects/equipment/KeyItem.js";
import Weapon from "../objects/equipment/Weapon.js";
import Map from "./Map.js";

/**
 * Encapsulates all definitions for instantiating new objects.
 */
export default class EquipmentFactory {
	/**
	 *
	 * @param {string} type The type of the equipment
	 * @param {Object} equipmentDefinition The properties of the equipment
	 * @returns a new instance of the equipment
	 */
	static createInstance(equipmentDefinition) {
		switch (equipmentDefinition.type) {
			case EquipmentName.Weapon:
				return new Weapon(equipmentDefinition);
			case EquipmentName.Armor:
				return new Armor(equipmentDefinition);
			case EquipmentName.KeyItem:
				return new KeyItem(equipmentDefinition);
			default:
				return new Equipment(equipmentDefinition);
		}
	}
}
