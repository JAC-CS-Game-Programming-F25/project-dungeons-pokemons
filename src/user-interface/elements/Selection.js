import UserInterfaceElement from "../UserInterfaceElement.js";
import SoundName from "../../enums/SoundName.js";
import { context, input, sounds, stateStack } from "../../globals.js";
import Vector from "../../../lib/Vector.js";
import Input from "../../../lib/Input.js";
import PanelOrientation from "../../enums/PanelOrientation.js";
import Colour from "../../enums/Colour.js";

export default class Selection extends UserInterfaceElement {
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
	 * @param {array} items Elements are objects that each
	 * have a string `text` and function `onSelect` property.
	 */
	constructor(x, y, width, height, items, orientation) {
		super(x, y, width, height);

		if (orientation === PanelOrientation.Horizontal)
			this.gap = this.dimensions.x / (items.length + 1);
		else this.gap = this.dimensions.y / (items.length + 1);

		this.orientation = orientation ?? PanelOrientation.Vertical;
		this.items = this.initializeItems(items, orientation);
		this.currentSelection = 0;
		this.font = this.initializeFont();
	}

	update() {
		if (this.orientation === PanelOrientation.Vertical) {
			if (input.isKeyPressed(Input.KEYS.W) || input.isKeyPressed(Input.KEYS.ARROW_UP)) {
				this.navigateUp();
			} else if (
				input.isKeyPressed(Input.KEYS.S) ||
				input.isKeyPressed(Input.KEYS.ARROW_DOWN)
			) {
				this.navigateDown();
			}
		}

		if (this.orientation === PanelOrientation.Horizontal) {
			if (input.isKeyPressed(Input.KEYS.A) || input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
				this.navigateUp();
			} else if (
				input.isKeyPressed(Input.KEYS.D) ||
				input.isKeyPressed(Input.KEYS.ARROW_RIGHT)
			) {
				this.navigateDown();
			}
		}

		if (input.isKeyPressed(Input.KEYS.ENTER) || input.isKeyPressed(Input.KEYS.SPACE)) {
			this.select();
		}
	}

	render() {
		this.items.forEach((item, index) => {
			this.renderSelectionItem(item, index);
		});
	}

	renderSelectionItem(item, index) {
		context.fillStyle = Colour.White;

		if (index === this.currentSelection) {
			context.fillStyle = Colour.Gold;
			this.renderSelectionArrow(item);
		}

		context.save();
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = this.font;
		context.fillText(item.text, item.position.x, item.position.y);
		context.restore();
	}

	renderSelectionArrow(item) {
		const textWidth = context.measureText(item.text).width;

		context.save();
		context.fillStyle = Colour.Gold;
		if (this.orientation === PanelOrientation.Horizontal)
			context.translate(item.position.x - textWidth / 2 - 15, item.position.y - 5);
		else context.translate(this.position.x + 10, item.position.y - 5);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(3, 2.5);
		context.lineTo(0, 5);
		context.closePath();
		context.fill();
		context.restore();
	}

	navigateUp() {
		sounds.play(SoundName.SelectionMove);

		if (this.currentSelection === 0) {
			this.currentSelection = this.items.length - 1;
		} else {
			this.currentSelection--;
		}
	}

	navigateDown() {
		sounds.play(SoundName.SelectionMove);

		if (this.currentSelection === this.items.length - 1) {
			this.currentSelection = 0;
		} else {
			this.currentSelection++;
		}
	}

	select() {
		//MYUPDATE
		// In here if the selected item is empty, then do not use callback
		const selected = this.items[this.currentSelection];

		if (selected.onSelect) {
			sounds.play(SoundName.SelectionChoice);
			this.items[this.currentSelection].onSelect();
		}
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
