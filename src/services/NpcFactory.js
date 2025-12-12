import GuyNPC from "../entities/npcs/GuyNPC.js";
import MomNPC from "../entities/npcs/MomNPC.js";
import { NPCNames } from "../enums/entities/NPCNames.js";
import Map from "./Map.js";

/**
 * Encapsulates all definitions for instantiating new npcs.
 */
export default class NPCFactory {
	/**
	 *
	 * @param {string} type the type of the npc
	 * @param {object} npcDefinition the definition of the npc in npc.json
	 * @param {Map} map the map that the npc is part of
	 * @returns a new instance of the npc type
	 */
	static createInstance(type, npcDefinition, map) {
		switch (type) {
			case NPCNames.Guy:
				return new GuyNPC(npcDefinition, map);
			case NPCNames.Mom:
				return new MomNPC(npcDefinition, map);
		}
	}
}
