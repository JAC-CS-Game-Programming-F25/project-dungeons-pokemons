import ObjectNames from "../enums/ObjectNames.js";
import Chest from "../objects/Chest.js";
import Map from "./Map.js";

/**
 * Encapsulates all definitions for instantiating new objects.
 */
export default class ObjectFactory {
	/**
	 *
	 * @param {string} type the type of the npc
	 * @param {object} npcDefinition the definition of the npc in npc.json
	 * @returns a new instance of the npc type
	 */
	static createInstance(type, npcDefinition) {
		switch (type) {
			case ObjectNames.Chest:
				return new Chest(npcDefinition);
			case ObjectNames.SaveCrystal:
		}
	}
}
