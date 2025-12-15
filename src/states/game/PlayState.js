import State from "../../../lib/State.js";
import SoundName from "../../enums/SoundName.js";
import Input from "../../../lib/Input.js";
import { input, sounds, stateStack, maps } from "../../globals.js";
import Panel from "../../user-interface/elements/Panel.js";
import DialogueState from "./DialogueState.js";

export default class PlayState extends State {
	/**
	 * Contains the main world map the player
	 * can travel within. If the player's Pokemon
	 * faints or the player hits 'P', heal the Pokemon
	 * to full health so they can continue playing.
	 * If the player hits Escape, show a menu displaying
	 * all the Pokemon's stats.
	 *
	 * @param {object} map
	 */
	constructor(map) {
		super();

		this.map = map;
	}

	enter() {
		sounds.play(SoundName.Route);

		// We do this to rebuild the render queue with the player inside
		this.map.renderQueue = this.map.buildEntityRenderQueue();

		if (JSON.parse(localStorage.getItem("newGame")))
			stateStack.push(
				new DialogueState(
					`Welcome to the world of Pokémon! \n\n\
			Press Enter to advance the text... \n\
			To start fighting Pokémon with your own \
			randomly assigned Pokémon, walk in the tall grass. \n\n\
			If you need to heal, press 'P' in the field! \n\n\
			Press 'Esc' to view your Pokémon's stats. \n\
			Good luck!`,
					Panel.TOP_DIALOGUE
				)
			);
	}

	update(dt) {
		this.map.update(dt);

		if (this.map.player.currentHealth === 0) {
			this.processDeath();
		}

		if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
			stateStack.push(new PokemonStatsState(this.map.player.party[0]));
		}

		if (input.isKeyPressed(Input.KEYS.p) || input.isKeyPressed(Input.KEYS.P)) {
			this.healFaintedPokemon();
		}
	}

	render() {
		this.map.render();
	}

	/**
	 * If you're familiar with the real Pokemon games,
	 * you'll know that this is where you'd be teleported
	 * to the Pokemon Center. Since we don't have one, we're
	 * going to use this as a temporary measure instead.
	 */
	processDeath() {
		sounds.pause(SoundName.Route);
		sounds.play(SoundName.Heal);

		this.map.player.heal();

		const message = `Your Pokemon have been healed back to full health...\n \n\
						Be extra careful next time!`;

		stateStack.push(
			new DialogueState(message, Panel.BOTTOM_DIALOGUE, () => sounds.play(SoundName.Route))
		);
	}

	/**
	 * Saves the current player position when entering a new map
	 */
	savePlayerPositions() {
		this.oldPlayerPosition = this.map.player.position;
		this.oldCanvasPosition = this.map.player.canvasPosition;
	}

	/**
	 * Resets the players position to the saved position of this state whenever the player reenters it.
	 */
	resetPlayerPosition() {
		this.map.player.position = this.oldPlayerPosition;
		this.map.player.canvasPosition = this.oldCanvasPosition;
		this.map.player.map = this.map;
	}
}
