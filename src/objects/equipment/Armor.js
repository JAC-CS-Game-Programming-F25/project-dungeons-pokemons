import Equipment from "./Equipment.js";

export default class Armor extends Equipment {
	constructor(armorDefinition) {
		super(armorDefinition);

		this.armorClass = armorDefinition.armorClass;
		this.elementalType = armorDefinition.elementalType;
	}

	// useEffect() {}
}
