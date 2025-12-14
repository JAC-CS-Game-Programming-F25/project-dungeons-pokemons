import Equipment from "./Equipment.js";

export default class Weapon extends Equipment {
	constructor(weaponDefinition) {
		super(weaponDefinition);

		this.damage = weaponDefinition.damage;
		this.damageType = weaponDefinition.elementalType;
	}

	calculateDamage(opponent) {}

	// useEffect() {}
}
