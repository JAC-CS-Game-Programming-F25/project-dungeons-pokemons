import { OFFSET_X, OFFSET_Y } from "../globals.js";
import Tile from "./Tile.js";

export default class Layer {
	static BOTTOM = 0;
	static COLLISION = 1;
	static TOP = 2;

	/**
	 * A collection of tiles that comprises
	 * one layer of the map. The tiles are stored
	 * in a 1D array instead of a 2D array to make
	 * accessing an individual tile more efficient
	 * when the layers are thousands of tiles long.
	 *
	 * @param {object} layerDefinition
	 * @param {array} sprites
	 */
	constructor(layerDefinition, sprites) {
		this.tiles = Layer.generateTiles(layerDefinition.data, sprites);
		this.width = layerDefinition.width;
		this.height = layerDefinition.height;
	}

	render(cameraEntity) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.getTile(x, y)?.render(
					// OFFSET_X * Tile.SIZE - cameraEntity.canvasPosition.x,
					// OFFSET_Y * Tile.SIZE - cameraEntity.canvasPosition.y
					x * Tile.SIZE + OFFSET_X * Tile.SIZE - cameraEntity.canvasPosition.x,
					y * Tile.SIZE + OFFSET_Y * Tile.SIZE - cameraEntity.canvasPosition.y
				);
			}
		}
	}

	/**
	 * The Y coordinate is multiplied by the map width
	 * to get us to the correct row, then the X coordinate
	 * is added to get us to the correct column in that row.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns The Tile that lives at (x, y) in the layer.
	 */
	getTile(x, y) {
		return this.tiles[x + y * this.width];
	}

	/**
	 * The Player can encounter wild Pokemon if they walk
	 * in the grass. As such, we have to have a way of
	 * checking if the current tile the player is standing
	 * on is a grass tile or not. This can later be updated
	 * as needed since encounters can occur in places like
	 * caves and in water as well.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns Whenter the current tile is a grass tile or not.
	 */
	isTileGrass(x, y) {
		return this.getTile(x, y).id === Tile.GRASS;
	}

	// Note: it would be better to have a single function for this and I would get the door info from a json file
	// but I saw the tip too late into the assignment

	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns if the tile player is colliding with is a closed door tile
	 */
	isOutsideTileDoor(x, y) {
		return this.getTile(x, y).id === Tile.DOOR_CLOSED;
	}

	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns if the tile player is colliding with is a closed door tile inside
	 */
	isInsideTileDoor(x, y) {
		return this.getTile(x, y).id === Tile.HOUSE_DOOR;
	}

	/**
	 * @param {object} layerData The exported layer data from Tiled.
	 * @param {array} sprites
	 * @returns An array of Tile objects.
	 */
	static generateTiles(layerData, sprites) {
		const tiles = [];

		layerData.forEach((tileId) => {
			// Tiled exports tile data starting from 1 and not 0, so we must adjust it.
			tileId--;

			// -1 means there should be no tile at this location.
			const tile = tileId === -1 ? null : new Tile(tileId, sprites);

			tiles.push(tile);
		});

		return tiles;
	}
}
