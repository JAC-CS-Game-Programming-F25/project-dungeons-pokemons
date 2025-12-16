import Equipment from "./Equipment.js";

export default class Armor extends Equipment {
	constructor(armorDefinition) {
		super(armorDefinition);

		this.value = armorDefinition.value;
		this.elementalType = armorDefinition.elementalType;
	}

	// useEffect() {}
}
