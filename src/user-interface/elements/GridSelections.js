import UserInterfaceElement from "../UserInterfaceElement.js";
import SoundName from "../../enums/SoundName.js";
import { context, input, sounds, stateStack } from "../../globals.js";
import Vector from "../../../lib/Vector.js";
import Input from "../../../lib/Input.js";
import Colour from "../../enums/Colour.js";
import { roundedRectangle } from "../../../lib/Drawing.js";

export default class GridSelection extends UserInterfaceElement {
	static BORDER_WIDTH = 10;

	/**
	 * A UI element that displays items in a 2x2 grid layout.
	 * Used for move selection in battles.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {array} items Elements are objects that each
	 * have a string `text` and function `onSelect` property.
	 */
	constructor(x, y, width, height, items) {
		super(x, y, width, height);

		this.items = this.initializeItems(items);
		this.currentSelection = 0;
		this.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		this.borderColour = Colour.Grey;
		this.panelColour = Colour.White;
	}

	update() {
		if (input.isKeyPressed(Input.KEYS.W) || input.isKeyPressed(Input.KEYS.ARROW_UP)) {
			this.navigateUp();
		} else if (input.isKeyPressed(Input.KEYS.S) || input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
			this.navigateDown();
		} else if (input.isKeyPressed(Input.KEYS.A) || input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
			this.navigateLeft();
		} else if (input.isKeyPressed(Input.KEYS.D) || input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
			this.navigateRight();
		} else if (input.isKeyPressed(Input.KEYS.ENTER) || input.isKeyPressed(Input.KEYS.SPACE)) {
			this.select();
		} else if (
			input.isKeyPressed(Input.KEYS.SHIFT_LEFT) ||
			input.isKeyPressed(Input.KEYS.SHIFT_RIGHT)
		) {
			stateStack.pop();
		}
	}

	render() {
		this.renderPanel();
		this.items.forEach((item, index) => {
			this.renderGridItem(item, index);
		});
	}

	renderPanel() {
		// Render background
		context.save();
		context.fillStyle = this.borderColour;
		roundedRectangle(
			context,
			this.position.x,
			this.position.y,
			this.dimensions.x,
			this.dimensions.y,
			GridSelection.BORDER_WIDTH,
			true,
			false
		);

		// Render foreground
		context.fillStyle = this.panelColour;
		roundedRectangle(
			context,
			this.position.x + GridSelection.BORDER_WIDTH / 2,
			this.position.y + GridSelection.BORDER_WIDTH / 2,
			this.dimensions.x - GridSelection.BORDER_WIDTH,
			this.dimensions.y - GridSelection.BORDER_WIDTH,
			GridSelection.BORDER_WIDTH,
			true,
			false
		);
		context.restore();
	}

	renderGridItem(item, index) {
		if (index === this.currentSelection) {
			this.renderSelectionArrow(item);
		}

		context.save();
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.font = this.font;
		context.fillStyle = "black";
		context.fillText(item.text, item.position.x, item.position.y);
		context.restore();
	}

	renderSelectionArrow(item) {
		context.save();
		context.fillStyle = "black";
		context.translate(item.position.x - 15, item.position.y - 5);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(6, 5);
		context.lineTo(0, 10);
		context.closePath();
		context.fill();
		context.restore();
	}

	navigateUp() {
		// Move up in grid (0->0, 1->1, 2->0, 3->1)
		if (this.currentSelection >= 2) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection -= 2;
		}
	}

	navigateDown() {
		// Move down in grid (0->2, 1->3, 2->2, 3->3)
		if (this.currentSelection < 2) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection += 2;
		}
	}

	navigateLeft() {
		// Move left in grid (0->0, 1->0, 2->2, 3->2)
		if (this.currentSelection % 2 === 1) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection--;
		}
	}

	navigateRight() {
		// Move right in grid (0->1, 1->1, 2->3, 3->3)
		if (this.currentSelection % 2 === 0) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection++;
		}
	}

	select() {
		const selectedItem = this.items[this.currentSelection];
		// Only select if onSelect exists (not null for empty slots)
		if (selectedItem.onSelect) {
			sounds.play(SoundName.SelectionChoice);
			selectedItem.onSelect();
		}
	}

	/**
	 * Initializes items in a 2x2 grid layout.
	 *
	 * @param {array} items
	 * @returns The items array with positions set for grid layout.
	 */
	initializeItems(items) {
		const gridItems = [];
		const cellWidth = this.dimensions.x / 2;
		const cellHeight = this.dimensions.y / 2;

		for (let i = 0; i < 4; i++) {
			const row = Math.floor(i / 2);
			const col = i % 2;

			const item = items[i] || { text: "-", onSelect: null };

			item.position = new Vector(
				this.position.x + col * cellWidth + 25,
				this.position.y + row * cellHeight + cellHeight / 2
			);

			gridItems.push(item);
		}

		return gridItems;
	}
}
