import EffectFactory from "../../services/EffectFactory.js";

export default class Equipment {
	constructor(equipmentDefinition) {
		this.name = equipmentDefinition.name;
		this.description = equipmentDefinition.description;
		this.effect = EffectFactory.getEffect(equipmentDefinition.effect) ?? null;
	}

	useEffect() {}
}
