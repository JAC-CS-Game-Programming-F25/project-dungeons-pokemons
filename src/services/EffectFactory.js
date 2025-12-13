import Heal from "../effects/Heal.js";
import Open from "../effects/Open.js";
import EffectName from "../enums/EffectName.js";
import ObjectNames from "../enums/ObjectNames.js";
import Chest from "../objects/Chest.js";
import SaveCrystal from "../objects/Crystal.js";
import Map from "./Map.js";

/**
 * Encapsulates all definitions for instantiating new objects.
 */
export default class EffectFactory {
	/**
	 *
	 * @param {Object} effect the effect object
	 * @returns a new instance of the npc type
	 */
	static getEffect(effect) {
		switch (effect.type) {
			case EffectName.Heal:
				return new Heal();
			case EffectName.Open:
				return new Open();
		}
	}
}
