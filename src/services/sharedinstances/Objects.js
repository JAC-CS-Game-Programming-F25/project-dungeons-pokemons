export default class Objects {
	constructor() {
		this.objects = {};
	}

	// Loads all npcs to the map
	load(objectDefinitions) {
		for (const [areaName, objectDefinition] of Object.entries(objectDefinitions)) {
			this.objects[areaName] = objectDefinition;
		}
	}

	// Gets the npcs from the specified map
	get(areaName) {
		return this.objects[areaName];
	}
}
