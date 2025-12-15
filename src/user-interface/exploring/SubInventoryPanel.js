import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import Panel from "../elements/Panel.js";
import Player from "../../entities/Player.js";
import Selection from "../elements/Selection.js";
import Menu from "../elements/Menu.js";
import GridSelection from "../elements/GridSelections.js";
import InfoPanel from "../elements/InfoPanel.js";
import PanelOrientation from "../../enums/PanelOrientation.js";

export default class SubInventoryPanel extends Panel {
	/**
	 * The Panel displayed beside the Player's Pokemon
	 * during battle that displays their name, health,
	 * level and experience.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Player} info\
	 * @param {object} options Options for the super Panel.
	 */
	constructor(x, y, width, height, title, relatedItems, info, options = {}) {
		super(x, y, width, height, options);

		this.infoPanel = new InfoPanel(1, 2.5, 3, 6, title, info);
		this.itemsSubMenu = new Menu(8, 2.5, 6, 7.5, relatedItems, PanelOrientation.Vertical);
	}

	update() {
		this.itemsSubMenu.update();
	}

	render() {
		super.render();
		this.infoPanel.render();
		this.itemsSubMenu.render();
	}
}
