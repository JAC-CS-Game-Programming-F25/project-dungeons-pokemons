import UserInterfaceElement from "../UserInterfaceElement.js";
import SoundName from "../../enums/SoundName.js";
import { context, input, sounds, stateStack } from "../../globals.js";
import Vector from "../../../lib/Vector.js";
import Input from "../../../lib/Input.js";
import Colour from "../../enums/Colour.js";
import { roundedRectangle } from "../../../lib/Drawing.js";

export default class GridSelection extends UserInterfaceElement {
	static BORDER_WIDTH = 5;
	static ITEMS_PER_PAGE = 6; // 2 columns x 3 rows
	static COLUMNS = 2;
	static ROWS = 3;

	/**
	 * A UI element that displays items in a 2x3 grid layout with pagination.
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

		this.allItems = items;
		this.currentPage = 0;
		this.currentSelection = 0;
		this.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		this.borderColour = Colour.White;
		this.panelColour = Colour.Black;

		// Calculate total pages
		this.totalPages = Math.ceil(this.allItems.length / GridSelection.ITEMS_PER_PAGE);

		// Arrow animation
		this.arrowAnimationTime = 0;
		this.arrowAnimationSpeed = 0.05;

		// Initialize displayed items for current page
		this.updateDisplayedItems();
	}

	update() {
		// Update arrow animation
		this.arrowAnimationTime += this.arrowAnimationSpeed;

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
		}
	}

	render() {
		this.renderPanel();
		this.renderPageArrows();
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

	renderPageArrows() {
		if (this.totalPages <= 1) return;

		const centerY = this.position.y + this.dimensions.y / 2;
		const arrowSize = 20;

		// Calculate bounce offset using sine wave
		const bounceOffset = Math.sin(this.arrowAnimationTime) * 1;

		context.save();
		context.fillStyle = Colour.White;

		// Left arrow (if not on first page)
		if (this.currentPage > 0) {
			const leftX = this.position.x + 15 + bounceOffset;
			context.beginPath();
			context.moveTo(leftX + arrowSize, centerY - arrowSize);
			context.lineTo(leftX, centerY);
			context.lineTo(leftX + arrowSize, centerY + arrowSize);
			context.lineTo(leftX + arrowSize - 8, centerY);
			context.closePath();
			context.fill();
		}

		// Right arrow (if not on last page)
		if (this.currentPage < this.totalPages - 1) {
			const rightX = this.position.x + this.dimensions.x - 15 - bounceOffset;
			context.beginPath();
			context.moveTo(rightX - arrowSize, centerY - arrowSize);
			context.lineTo(rightX, centerY);
			context.lineTo(rightX - arrowSize, centerY + arrowSize);
			context.lineTo(rightX - arrowSize + 8, centerY);
			context.closePath();
			context.fill();
		}

		context.restore();
	}

	renderGridItem(item, index) {
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
		context.save();
		// Position arrow to the left of centered text
		const textWidth = context.measureText(item.text).width;
		context.translate(item.position.x - textWidth / 2 - 15, item.position.y - 5);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(3, 2.5);
		context.lineTo(0, 5);
		context.closePath();
		context.fill();
		context.restore();
	}

	navigateUp() {
		// Move up in grid
		if (this.currentSelection >= GridSelection.COLUMNS) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection -= GridSelection.COLUMNS;
		}
	}

	navigateDown() {
		// Move down in grid
		const maxSelectionOnPage = this.items.length - 1;
		if (this.currentSelection + GridSelection.COLUMNS <= maxSelectionOnPage) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection += GridSelection.COLUMNS;
		}
	}

	navigateLeft() {
		const col = this.currentSelection % GridSelection.COLUMNS;

		// If in right column, move to left column
		if (col === 1) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection--;
		}
		// If in left column and not on first page, go to previous page
		else if (col === 0 && this.currentPage > 0) {
			sounds.play(SoundName.SelectionMove);
			this.currentPage--;
			this.updateDisplayedItems();
			// Try to maintain similar position on new page
			const targetIndex = this.currentSelection + 1; // Move to right column
			if (targetIndex < this.items.length) {
				this.currentSelection = targetIndex;
			}
		}
	}

	navigateRight() {
		const col = this.currentSelection % GridSelection.COLUMNS;
		const maxSelectionOnPage = this.items.length - 1;

		// If in left column and right column exists on current page, move to right column
		if (col === 0 && this.currentSelection + 1 <= maxSelectionOnPage) {
			sounds.play(SoundName.SelectionMove);
			this.currentSelection++;
		}
		// If in right column and not on last page, go to next page
		else if (col === 1 && this.currentPage < this.totalPages - 1) {
			sounds.play(SoundName.SelectionMove);
			this.currentPage++;
			this.updateDisplayedItems();
			// Try to maintain similar position on new page, default to left column
			const targetIndex = this.currentSelection - 1;
			this.currentSelection = Math.min(targetIndex, this.items.length - 1);
			// Ensure we're in left column
			if (this.currentSelection % GridSelection.COLUMNS === 1 && this.currentSelection > 0) {
				this.currentSelection--;
			}
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
	 * Updates the displayed items based on current page.
	 */
	updateDisplayedItems() {
		const startIndex = this.currentPage * GridSelection.ITEMS_PER_PAGE;
		const endIndex = Math.min(startIndex + GridSelection.ITEMS_PER_PAGE, this.allItems.length);
		const pageItems = this.allItems.slice(startIndex, endIndex);

		this.items = this.initializeItems(pageItems);

		// Ensure current selection is valid for this page
		if (this.currentSelection >= this.items.length) {
			this.currentSelection = Math.max(0, this.items.length - 1);
		}
	}

	/**
	 * Initializes items in a 2x3 grid layout with centered text.
	 *
	 * @param {array} items
	 * @returns The items array with positions set for grid layout.
	 */
	initializeItems(items) {
		const gridItems = [];
		const cellWidth = this.dimensions.x / GridSelection.COLUMNS;
		const cellHeight = this.dimensions.y / GridSelection.ROWS;

		items.forEach((item, i) => {
			const row = Math.floor(i / GridSelection.COLUMNS);
			const col = i % GridSelection.COLUMNS;

			const gridItem = item || { text: "-", onSelect: null };

			// Center items in each cell
			gridItem.position = new Vector(
				this.position.x + col * cellWidth + cellWidth / 2,
				this.position.y + row * cellHeight + cellHeight / 2
			);

			gridItems.push(gridItem);
		});

		return gridItems;
	}
}
