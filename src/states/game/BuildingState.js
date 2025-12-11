import PlayState from "./PlayState.js";
import Vector from "../../../lib/Vector.js";
import Tile from "../../services/Tile.js";

export default class BuildingState extends PlayState {
	/**
	 * Contains the building map the player
	 * can travel within. It extends playstate since the basic functionalities
	 * are the same, we just need a different state whenever we enter a building.
	 *
	 * @param {object} map
	 */
	constructor(map) {
		super(map);
	}

	enter() {
		this.map.player.position = new Vector(4, 8);
		this.map.player.canvasPosition = new Vector(
			Math.floor(this.map.player.position.x * Tile.SIZE),
			Math.floor(this.map.player.position.y * Tile.SIZE)
		);
	}
}
