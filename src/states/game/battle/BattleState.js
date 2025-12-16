import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import ImageName from "../../../enums/ImageName.js";
import SoundName from "../../../enums/SoundName.js";
import { images, sounds, stateStack, timer } from "../../../globals.js";
import BattleOpponentPanel from "../../../user-interface/battle/OpponentPanel.js";
import BattlePlayerPanel from "../../../user-interface/battle/PlayerPanel.js";
import Panel from "../../../user-interface/elements/Panel.js";
import Pokemon from "../../../entities/Pokemon.js";
import BattleMenuState from "./BattleMenuState.js";
import BattleMessageState from "./BattleMessageState.js";
import TransitionState from "../TransitionState.js";
import Opponent from "../../../entities/Opponent.js";
import Easing from "../../../../lib/Easing.js";
import ProgressBar from "../../../user-interface/elements/ProgressBar.js";
import Tile from "../../../services/Tile.js";
import Vector from "../../../../lib/Vector.js";

export default class BattleState extends State {
	static PLAYER_PLATFORM = { x: 0, y: 200 };
	static OPPONENT_PLATFORM = { x: 215, y: 80 };

	/**
	 * When a Player encounters a Pokemon in the wild the
	 * Player's Pokemon and Opponent Pokemon will battle.
	 * This state serves as the starting point for the battle.
	 *
	 * @param {Player} player
	 * @param {Opponent} opponent
	 */
	constructor(player, opponent) {
		super();

		this.player = player;
		this.opponent = opponent;
		this.playerPokemon = player.party[0];
		this.opponentPokemon = opponent.party[0];

		this.opponentPokemon.prepareForBattle(Pokemon.FRONT_POSITION);

		this.didBattleStart = false;

		this.panel = new Panel(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height
		);

		this.playerPanel = new BattlePlayerPanel(
			Panel.BATTLE_PLAYER.x,
			Panel.BATTLE_PLAYER.y,
			Panel.BATTLE_PLAYER.width,
			Panel.BATTLE_PLAYER.height,
			this.player
		);
		this.opponentPanel = new BattleOpponentPanel(
			Panel.BATTLE_OPPONENT.x,
			Panel.BATTLE_OPPONENT.y,
			Panel.BATTLE_OPPONENT.width,
			Panel.BATTLE_OPPONENT.height,
			this.opponentPokemon
		);
	}

	enter() {
		// Have to do it here to avoid seeing player teleport before we tween in
		if (!this.didBattleStart) this.player.prepareForBattle(Player.BATTLE_POSITION);
	}

	update(dt) {
		this.player.currentAnimation.update(dt);
		this.player.currentFrame = this.player.currentAnimation.currentFrame;

		if (!this.didBattleStart) {
			this.triggerBattleStart();
		}
	}

	render() {
		this.renderBackground();
		this.renderForeground();
	}

	renderBackground() {
		images.render(ImageName.BattleBackground, 0, 0);
	}

	renderForeground() {
		this.player.render();
		this.opponentPokemon.render(this.player);
		this.panel.render();
		this.playerPanel.render();

		if (!this.opponentPokemon.outOfBattle) this.opponentPanel.render();
	}

	triggerBattleStart() {
		this.didBattleStart = true;

		sounds.play(SoundName.BattleLoop);
		timer.tween(
			this.opponentPokemon.position,
			{ x: Pokemon.FRONT_POSITION.end.x },
			0.75,
			Easing.linear,
			() => this.triggerStartingDialogue()
		);
	}

	triggerStartingDialogue() {
		sounds.play(this.opponentPokemon.name.toLowerCase());
		stateStack.push(
			new BattleMessageState(`A wild ${this.opponentPokemon.name} appeared!`, 0, () => {
				stateStack.push(
					new BattleMessageState(`Go ${this.playerPokemon.name}!`, 0, () =>
						this.sendOutPlayerPokemon()
					)
				);
			})
		);
	}

	sendOutPlayerPokemon() {
		timer.tween(
			this.player.canvasPosition,
			{ x: Player.BATTLE_POSITION.end.x },
			0.75,
			Easing.linear,
			() => {
				this.player.attackAnimation(true);
				sounds.play(SoundName.WeaponPull);
				stateStack.push(new BattleMenuState(this));
			}
		);
	}

	exitBattle() {
		TransitionState.fade(() => {
			stateStack.pop();
			sounds.stop(SoundName.BattleLoop);
			sounds.stop(SoundName.BattleVictory);
			sounds.play(SoundName.Route);

			if (!this.player.fainted)
				this.player.canvasPosition = new Vector(
					Math.floor(this.player.position.x * Tile.SIZE),
					Math.floor(this.player.position.y * Tile.SIZE)
				);
			else this.player.revive();
		});
	}
}
