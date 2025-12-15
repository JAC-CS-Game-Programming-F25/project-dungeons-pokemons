import UserInterfaceElement from "../UserInterfaceElement.js";
import SoundName from "../../enums/SoundName.js";
import { context, input, sounds, stateStack } from "../../globals.js";
import Vector from "../../../lib/Vector.js";
import Input from "../../../lib/Input.js";
import PanelOrientation from "../../enums/PanelOrientation.js";
import Colour from "../../enums/Colour.js";
import Panel from "./Panel.js";
import Tile from "../../services/Tile.js";

export default class InfoPanel extends Panel {
	/**
	 * A UI element that gives us a list of textual items that link to callbacks;
	 * this particular implementation only has one dimension of items (vertically),
	 * but a more robust implementation might include columns as well for a more
	 * grid-like selection, as seen in many other kinds of interfaces and games.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {array} info Elements are objects that each
	 * have a string `text` and function `onSelect` property.
	 */
	constructor(
		x,
		y,
		width,
		height,
		title,
		currentEquipped,
		info,
		orientation = PanelOrientation.Vertical
	) {
		super(x, y, width, height);

		// if (orientation === PanelOrientation.Horizontal)
		// 	this.gap = this.dimensions.x / (info.length + 1);
		// else this.gap = this.dimensions.y / (info.length + 1);

		this.items = info;
		this.title = title ?? "";
		this.currentEquipment = currentEquipped;
		// this.items = this.initializeItems(info, orientation);
		this.font = this.initializeFont();
	}

	render() {
		this.renderTitle("Current", { y: 3.3 * Tile.SIZE });

		this.currentEquipment.forEach((equipment) => {
			this.renderItem(equipment, { y: 4.3 * Tile.SIZE });
		});

		if (this.title !== "") this.renderTitle(this.title, { y: 5.3 * Tile.SIZE });

		this.items.forEach((item) => {
			this.renderItem(item, { y: 6.3 * Tile.SIZE });
		});
	}

	renderTitle(title, options) {
		context.save();
		context.fillStyle = Colour.Gold;
		context.font = "20px CormorantUnicase";
		context.textBaseline = "middle";

		// Title
		context.fillText(title, 3.3 * Tile.SIZE, options.y);

		// Title divider lines

		context.strokeStyle = Colour.White;
		context.beginPath();
		context.moveTo(1.5 * Tile.SIZE, options.y);
		context.lineTo(3 * Tile.SIZE, options.y);
		context.moveTo(6 * Tile.SIZE, options.y);
		context.lineTo(7.5 * Tile.SIZE, options.y);
		context.stroke();
		context.restore();
	}

	renderItem(item, options) {
		context.save();
		context.textBaseline = "middle";
		context.fillStyle = Colour.White;

		context.fillText(item.text, 2 * Tile.SIZE, options.y);

		if (item.value) context.fillText(item.value, 6.5 * Tile.SIZE, options.y);
		context.restore();
	}

	/**
	 * Adds a position property to each item to be used for rendering.
	 *
	 * @param {array} items
	 * @returns The items array where each item now has a position property.
	 */
	initializeItems(items, orientation) {
		if (orientation === PanelOrientation.Horizontal) {
			let currentX = this.position.x;

			items.forEach((item) => {
				const padding = currentX + this.gap;

				item.position = new Vector(padding, this.position.y + this.dimensions.y / 2);

				currentX += this.gap;
			});
		} else {
			let currentY = this.position.y;

			items.forEach((item) => {
				const padding = currentY + this.gap;

				item.position = new Vector(this.position.x + this.dimensions.x / 2, padding);

				currentY += this.gap;
			});
		}

		return items;
	}

	/**
	 * Scales the font size based on the size of this Selection element.
	 */
	initializeFont() {
		return `${Math.min(UserInterfaceElement.FONT_SIZE, this.gap)}px ${
			UserInterfaceElement.FONT_FAMILY
		}`;
	}
}
