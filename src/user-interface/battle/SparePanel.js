import Panel from "../elements/Panel.js";
import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import ProgressBar from "../elements/ProgressBar.js";
import Selection from "../elements/Selection.js";

export default class SparePanel extends Panel {
	static SPARE_BAR_WIDTH = 80;
	static SPARE_MENU = { x: 0, y: 8, width: 4, height: 3 };

	/**
	 * The Panel displayed beside the opponent's Pokemon
	 * during battle that displays their name and health.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Pokemon[]} opponents
	 * @param {object} options Options for the super Panel.
	 */
	constructor(x, y, width, height, items, options = {}) {
		super(x, y, width, height, options);

		this.spareBars = [];

		this.items = items;

		// Selection that will be on the left of the panel
		this.options = new Selection(x, y, width - 11, height, items);

		items.forEach((opponent, index) => {
			this.spareBars.push(
				new ProgressBar(
					this.position.x + this.dimensions.x - SparePanel.SPARE_BAR_WIDTH - 20,
					this.options.items[index].position.y,
					SparePanel.SPARE_BAR_WIDTH,
					16,
					opponent.mercyMeter,
					Pokemon.MERCY_NEEDED,
					"yellow",
					"orange"
				)
			);
		});
	}

	update() {
		this.options.update();
	}

	render() {
		super.render();

		// Renders the selection options
		this.options.render();

		// Renders each spare bar and its percentage
		this.spareBars.forEach((spareBar, index) => {
			spareBar.render();
			this.renderPercentage(spareBar, index);
		});
	}

	renderPercentage(spareBar, index) {
		context.save();
		context.textBaseline = "top";
		context.fillStyle = Colour.Black;
		context.font = `12px ${UserInterfaceElement.FONT_FAMILY}`;
		context.fillText(
			`${this.items[index].mercyMeter}%`,
			spareBar.x + 5,
			spareBar.y + spareBar.height / 2 - 6
		);

		context.restore();
	}
}
