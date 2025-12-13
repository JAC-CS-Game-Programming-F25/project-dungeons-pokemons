import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Pokemon from "../../../entities/Pokemon.js";
import { input, stateStack } from "../../../globals.js";
import SparePanel from "../../../user-interface/battle/SparePanel.js";
import Menu from "../../../user-interface/elements/Menu.js";
import Panel from "../../../user-interface/elements/Panel.js";
import ProgressBar from "../../../user-interface/elements/ProgressBar.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleTurnState from "./BattleTurnState.js";

export default class BattleSpareMenuState extends State {
	/**
	 *
	 * @param {Pokemon} opponent
	 */
	constructor(opponents, battleState) {
		super();

		const items = [];

		opponents.forEach((opponent) => {
			items.push({
				text: `${opponent.name}`,
				mercyMeter: opponent.mercyMeter,
				onSelect: () => {
					if (opponent.mercyMeter >= 100) {
						stateStack.pop();
						stateStack.pop();
						stateStack.push(
							new BattleMessageState(`You spared ${opponent.name}!`, 0, () => {
								opponent.spare();
								stateStack.push(new BattleTurnState(battleState));
							})
						);
					} else {
						stateStack.push(
							new BattleMessageState(`${opponent.name} growls at you`),
							0
						);
					}
				},
			});
		});

		this.sparePanel = new SparePanel(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			items
		);
	}

	update() {
		this.sparePanel.update();
		if (
			input.isKeyPressed(Input.KEYS.SHIFT_LEFT) ||
			input.isKeyPressed(Input.KEYS.SHIFT_RIGHT)
		) {
			stateStack.pop();
		}
	}

	render() {
		this.sparePanel.render();
	}
}
