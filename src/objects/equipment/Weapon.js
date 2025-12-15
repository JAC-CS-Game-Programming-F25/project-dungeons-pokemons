import Equipment from "./Equipment.js";

export default class Weapon extends Equipment {
	constructor(weaponDefinition) {
		super(weaponDefinition);

		this.value = weaponDefinition.value;
		this.elementalType = weaponDefinition.elementalType;
	}

	calculateDamage(opponent) {}

	// useEffect() {}
}
