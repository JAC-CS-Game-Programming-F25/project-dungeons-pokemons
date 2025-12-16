import State from "../../../../lib/State.js";
import SoundName from "../../../enums/SoundName.js";
import { sounds, stateStack } from "../../../globals.js";
import GridSelection from "../../../user-interface/elements/GridSelections.js";
import Menu from "../../../user-interface/elements/Menu.js";
import Panel from "../../../user-interface/elements/Panel.js";
import BattleInventoryMenuState from "./BattleInventoryState.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleSpareMenuState from "./BattleSpareMenuState.js";
import BattleState from "./BattleState.js";
import BattleTurnState from "./BattleTurnState.js";

export default class BattleMenuState extends State {
	static MENU_OPTIONS = {
		Fight: "FIGHT",
		Act: "ACT",
		Items: "ITEMS",
		Spare: "SPARE",
	};

	/**
	 * Represents the menu during the battle that the Player can choose an action from.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		this.battleState = battleState;

		const items = [
			{ text: BattleMenuState.MENU_OPTIONS.Fight, onSelect: () => this.fight() },
			{ text: BattleMenuState.MENU_OPTIONS.Act, onSelect: () => this.act() },
			{ text: BattleMenuState.MENU_OPTIONS.Items, onSelect: () => this.showInventory() },
			{ text: BattleMenuState.MENU_OPTIONS.Spare, onSelect: () => this.showSpareMenu() },
		];

		this.battleMenu = new Menu(
			Menu.BATTLE_MENU.x,
			Menu.BATTLE_MENU.y,
			Menu.BATTLE_MENU.width,
			Menu.BATTLE_MENU.height,
			items
		);
	}

	update(dt) {
		this.battleMenu.update();
		this.battleState.update(dt);
	}

	render() {
		this.battleMenu.render();
	}

	fight() {
		stateStack.pop();
		stateStack.push(new BattleTurnState(this.battleState, this));
	}

	act() {
		sounds.play(SoundName.Act);
		stateStack.push(
			new BattleMessageState(`You did something silly, the pokemon liked that`, 0, () => {
				if (this.battleState.opponentPokemon.mercyMeter < 100)
					this.battleState.opponentPokemon.mercyMeter += 25;
			})
		);
	}

	showInventory() {
		if (this.battleState.player.inventory.length < 0) {
			stateStack.push(new BattleMessageState(`You have no items...`, 1.5));
		} else {
			stateStack.push(
				new BattleInventoryMenuState(
					this.battleState.player,
					this.battleState.player.inventory,
					this.battleState
				)
			);
		}
	}

	showSpareMenu() {
		stateStack.push(
			new BattleSpareMenuState([this.battleState.opponentPokemon], this.battleState)
		);
	}
}
