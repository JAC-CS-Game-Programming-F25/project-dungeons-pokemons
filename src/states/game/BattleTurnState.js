import State from "../../../lib/State.js";
import SoundName from "../../enums/SoundName.js";
import { CANVAS_HEIGHT, sounds, stateStack, timer } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import BattleMenuState from "./BattleMenuState.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleState from "./BattleState.js";
import { oneInXChance } from "../../../lib/Random.js";
import Easing from "../../../lib/Easing.js";
import Vector from "../../../lib/Vector.js";
import Tile from "../../services/Tile.js";

export default class BattleTurnState extends State {
	/**
	 * When Pokemon attack each other, this state takes
	 * care of lowering their health and reflecting the
	 * changes in the UI. If the Player is victorious,
	 * the Pokemon is awarded with experience based on the
	 * opponent Pokemon's stats.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		//debuging MYUPDATE
		//this.playerPokemon.attack = 100;
		//this.playerPokemon.speed = 100;

		this.battleState = battleState;
		this.player = battleState.player;
		this.opponentPokemon = battleState.opponentPokemon;

		// Store the moves to be used this turn //MYUPDATE
		this.playerMove = this.player.move;
		this.opponentMove = this.opponentPokemon.getRandomMove(); // For cpu this will get random move

		// Determine the order of attack based on the Pokemons' speed.
		//passing first move and second move
		if (this.player.speed > this.opponentPokemon.speed) {
			// Now the two attackers are always the player himself and the opposing pokemon
			this.firstAttacker = this.player;
			this.secondAttacker = this.opponentPokemon;
			this.firstMove = this.playerMove;
			this.secondMove = this.opponentMove;
		} else if (this.player.speed < this.opponentPokemon.speed) {
			this.firstAttacker = this.opponentPokemon;
			this.secondAttacker = this.player;
			this.firstMove = this.opponentMove;
			this.secondMove = this.playerMove;
		} else if (oneInXChance(2)) {
			this.firstAttacker = this.player;
			this.secondAttacker = this.opponentPokemon;
			this.firstMove = this.playerMove;
			this.secondMove = this.opponentMove;
		} else {
			this.firstAttacker = this.opponentPokemon;
			this.secondAttacker = this.player;
			this.firstMove = this.opponentMove;
			this.secondMove = this.playerMove;
		}
	}

	// Additional first and second move passed as parameter
	enter() {
		this.attack(this.firstAttacker, this.secondAttacker, this.firstMove, () => {
			if (this.checkBattleEnded()) {
				stateStack.pop();
				return;
			}

			this.attack(this.secondAttacker, this.firstAttacker, this.secondMove, () => {
				if (this.checkBattleEnded()) {
					this.player.canvasPosition = new Vector(
						Math.floor(this.player.position.x * Tile.SIZE),
						Math.floor(this.player.position.y * Tile.SIZE)
					);
					stateStack.pop();
					return;
				}

				stateStack.pop();
				stateStack.push(new BattleMenuState(this.battleState));
			});
		});
	}

	update() {
		this.battleState.update();
	}

	/**
	 * Animate the attacking Pokemon and deal damage to the defending Pokemon.
	 * Move the attacker forward and back quickly to indicate an attack motion.
	 *
	 * @param {Pokemon} attacker
	 * @param {Pokemon} defender
	 * @param {function} callback
	 */
	attack(attacker, defender, move, callback) {
		stateStack.push(
			new BattleMessageState(`${attacker.name} used ${move.name}!`, 1, () => {
				timer.tween(
					attacker.canvasPosition,
					{ x: attacker.attackPosition.x, y: attacker.attackPosition.y },
					0.1,
					Easing.linear,
					() => {
						timer.tween(
							attacker.canvasPosition,
							{ x: attacker.battlePosition.x, y: attacker.battlePosition.y },
							0.1,
							Easing.linear,
							() => this.inflictDamage(attacker, defender, move, callback)
						);
					}
				);
			})
		);
	}

	/**
	 * Flash the defender to indicate they were attacked.
	 * When finished, decrease the defender's health bar with tweening.
	 */
	inflictDamage(attacker, defender, move, callback) {
		const action = () => {
			defender.alpha = defender.alpha === 1 ? 0.5 : 1;
		};
		const interval = 0.05;
		const duration = 0.5;

		timer.addTask(action, interval, duration, () => {
			defender.alpha = 1;

			// Calculate damage
			const damageEffectivness = attacker.inflictDamage(defender, move);

			if (damageEffectivness == 2) sounds.play(SoundName.HitSuperEffective);
			else if (damageEffectivness == 0.5) sounds.play(SoundName.HitNotEffective);
			else sounds.play(SoundName.BattleDamage);

			// Get the appropriate panel for the defender
			const defenderPanel =
				defender === this.player
					? this.battleState.playerPanel
					: this.battleState.opponentPanel;

			// Tween the health bar display value //MYUPDATE
			timer.tween(
				defenderPanel.healthBar,
				{ displayValue: defender.currentHealth },
				0.5,
				Easing.linear,
				() => {
					//This displays the text for effectivness
					if (damageEffectivness == 2) {
						stateStack.push(
							new BattleMessageState("It's super effective!", 1, callback)
						);
					} else if (damageEffectivness == 0.5) {
						stateStack.push(
							new BattleMessageState("It's not very effective...", 1, callback)
						);
					} else callback();
				}
			);
		});
	}

	checkBattleEnded() {
		if (this.player.currentHealth <= 0) {
			this.processDefeat();
			return true;
		} else if (this.opponentPokemon.currentHealth <= 0) {
			this.processVictory();
			return true;
		}
		return false;
	}

	/**
	 * Tween the Player Pokemon off the bottom of the screen.
	 * Fade out and transition back to the PlayState.
	 */
	processDefeat() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(this.player.canvasPosition, { y: CANVAS_HEIGHT }, 0.2, Easing.linear, () => {
			stateStack.push(
				new BattleMessageState(`${this.player.name} fainted!`, 0, () =>
					this.battleState.exitBattle()
				)
			);
		});
	}

	/**
	 * Tween the Opponent Pokemon off the bottom of the screen.
	 * Process experience gained by the Player Pokemon.
	 */
	processVictory() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(this.opponentPokemon.position, { y: CANVAS_HEIGHT }, 0.4, Easing.linear, () => {
			sounds.stop(SoundName.BattleLoop);
			sounds.play(SoundName.BattleVictory);
			stateStack.push(new BattleMessageState("You won!", 0, () => this.processExperience()));
		});
	}

	processExperience() {
		const experience = this.player.calculateExperienceToAward(this.opponentPokemon);
		const message = `${this.player.name} earned ${experience} experience points!`;

		stateStack.push(
			new BattleMessageState(
				message,
				0,
				() => this.tweenExperienceBar(experience) // MYUPDATE
			)
		);
	}

	/**
	 * Tween the experience bar and then process level up.
	 */
	tweenExperienceBar(experience) {
		// MYUPDATE
		// Play experience gain sound
		sounds.play(SoundName.ExperienceGain);

		// Calculate the new experience values
		const startExp = this.player.currentExperience - this.player.levelExperience;
		const endExp = startExp + experience;

		// Update the actual Pokemon experience
		this.player.currentExperience += experience;

		// Tween the experience bar display value
		timer.tween(
			this.battleState.playerPanel.experienceBar,
			{ displayValue: endExp },
			1.5,
			Easing.linear,
			() => {
				sounds.stop(SoundName.ExperienceGain);
				this.processLevelUp();
			}
		);
	}

	processLevelUp() {
		// Level up if we've gone over the experience threshold.
		if (this.player.currentExperience < this.player.targetExperience) {
			this.battleState.exitBattle();
			return;
		}

		sounds.play(SoundName.ExperienceFull);

		this.player.levelUp();

		this.updateProgressBar();

		stateStack.push(
			new BattleMessageState(
				`${this.player.name} grew to LV. ${this.player.level}!`,
				0,
				() => this.newStatPanel() //MYUPDATE
			)
		);
	}

	//MYUPDATES
	//helper functiont that will update health and experience bar upon level up
	updateProgressBar() {
		this.battleState.playerPanel.healthBar.displayValue = this.player.currentHealth;

		this.battleState.playerPanel.experienceBar.displayValue =
			this.player.currentExperience - this.player.levelExperience;
	}
	// New state panel
	newStatPanel() {
		stateStack.push(
			new BattleMessageState(
				`Health: ${this.player.oldHealth} -> ${this.player.maxHealth},  Attack: ${this.player.oldAttack} -> ${this.player.attack} 
				Defense: ${this.player.oldDefense} ->  ${this.player.defense},  Speed: ${this.player.oldSpeed} -> ${this.player.speed}`,
				0,
				() => this.battleState.exitBattle()
			)
		);
	}
}
