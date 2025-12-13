import State from "../../../../lib/State.js";
import Pokemon from "../../../entities/Pokemon.js";
import Menu from "../../../user-interface/elements/Menu.js";
import Panel from "../../../user-interface/elements/Panel.js";
import ProgressBar from "../../../user-interface/elements/ProgressBar.js";

export default class BattleSpareMenuState extends State {
	/**
	 *
	 * @param {Pokemon} opponent
	 */
	constructor(opponents) {
		super();

		this.spareBars = [];
		this.items = [];

		opponents.forEach((opponent) => {
			items.push({ text: `${opponent.name}`, onSelect: () => opponent.spare() });
			this.spareBars.push(new ProgressBar(Panel));
		});
		const items = [];

		this.spareMenu = new Menu(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			items
		);
	}
}
