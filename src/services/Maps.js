export default class Maps {
	constructor() {
		this.maps = {};
	}

	// Loads all the map json objects
	load(mapDefinitions) {
		for (const [name, mapDefinition] of Object.entries(mapDefinitions)) {
			this.maps[name] = mapDefinition;
		}
	}

	// Gets the map using its name assigned when making the definition
	get(name) {
		return this.maps[name];
	}
}
