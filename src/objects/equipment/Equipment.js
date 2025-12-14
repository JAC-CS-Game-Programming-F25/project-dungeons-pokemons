import EffectFactory from "../../services/EffectFactory.js";

export default class Equipment {
	constructor(equipmentDefinition) {
		// Need to save the type for when rebooting the game
		this.type = equipmentDefinition.type;
		this.name = equipmentDefinition.name;
		this.description = equipmentDefinition.description;
		this.effect = EffectFactory.getEffect(equipmentDefinition.effect) ?? null;
	}

	useEffect() {
		//TODO:
		console.log("effect woo hoo");
	}
}
