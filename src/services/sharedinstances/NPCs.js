export default class NPCs {
	constructor() {
		this.npcs = {};
	}

	// Loads all npcs to the map
	load(npcDefinitions) {
		for (const [areaName, npcDefinition] of Object.entries(npcDefinitions)) {
			this.npcs[areaName] = npcDefinition;
		}
	}

	// Gets the npcs from the specified map
	get(areaName) {
		return this.npcs[areaName];
	}
}
