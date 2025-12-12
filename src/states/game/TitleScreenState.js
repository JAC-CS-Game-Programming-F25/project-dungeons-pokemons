import State from "../../../lib/State.js";
import Colour from "../../enums/Colour.js";
import ImageName from "../../enums/ImageName.js";
import PokemonName from "../../enums/entities/PokemonName.js";
import SoundName from "../../enums/SoundName.js";
import PlayState from "./PlayState.js";
import TransitionState from "./TransitionState.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	images,
	input,
	pokemonFactory,
	sounds,
	stateStack,
	timer,
	maps,
} from "../../globals.js";
import Input from "../../../lib/Input.js";
import Easing from "../../../lib/Easing.js";
import Player from "../../entities/Player.js";
import Vector from "../../../lib/Vector.js";
import Map from "../../services/Map.js";

export default class TitleScreenState extends State {
	static POSITION = {
		start: { x: 480, y: 150 },
		mid: { x: 160, y: 150 },
		end: { x: -160, y: 150 },
	};

	/**
	 * Consists of some text fields and a carousel of
	 * sprites that are displayed on the screen. There
	 * is then a fading transition to the next screen.
	 *
	 * @param {object} mapName
	 */
	constructor(mapName) {
		super();

		// this.pokemon = this.initializePokemon();

		// I create the map within the title screen since I need to be able to pass the player instance to the map
		// This removes the issue of having a bunch of player instances in the game.

		const mapDefinition = maps.get(mapName);

		this.map = new Map(mapDefinition, null, ImageName.Tiles, mapName);
		this.player = new Player({ position: new Vector(7, 5) }, this.map);
		this.map.player = this.player;

		// this.currentPokemonIndex = 0;
		// this.currentPokemon = this.pokemon[0];
		this.playState = new PlayState(this.map);
	}

	enter() {
		sounds.play(SoundName.Title);
		// this.revolvePokemon();
	}

	exit() {
		sounds.stop(SoundName.Title);
		this.timer?.clear();
	}

	update() {
		if (input.isKeyHeld(Input.KEYS.ENTER)) {
			this.play();
		}
	}

	render() {
		context.save();
		this.renderTitle();
		// this.renderTeam();
		this.renderText();
		context.restore();
	}

	renderTitle() {
		images.render(ImageName.Title, 0, 0);
		context.font = "80px Pokemon";
		context.textAlign = "center";
		context.fillStyle = Colour.DodgerBlue;
		context.fillText("Pokémon", CANVAS_WIDTH / 2, 100);
		context.fillStyle = Colour.Gold;
		context.fillText("Pokémon", CANVAS_WIDTH / 2 + 8, 108);
	}

	renderTeam() {
		images.render(ImageName.TrainerMay, CANVAS_WIDTH / 2 + 20, 120);
		this.currentPokemon.render();
	}

	renderText() {
		context.font = "40px PowerRed";
		context.fillStyle = Colour.White;
		context.fillText("Press Enter to Start", CANVAS_WIDTH / 2, 320);
	}

	initializePokemon() {
		const pokemon = [
			pokemonFactory.createInstance(PokemonName.Bulbasaur),
			pokemonFactory.createInstance(PokemonName.Charmander),
			pokemonFactory.createInstance(PokemonName.Squirtle),
		];

		pokemon.forEach((pokemon) => {
			pokemon.sprites = pokemon.battleSprites;
			pokemon.position.set(
				TitleScreenState.POSITION.start.x,
				TitleScreenState.POSITION.start.y
			);
		});

		return pokemon;
	}

	getNextIndex() {
		this.currentPokemonIndex++;
		this.currentPokemonIndex %= this.pokemon.length;

		return this.currentPokemonIndex;
	}

	revolvePokemon() {
		this.timer = timer.addTask(() => this.slideOn(), 3);
	}

	slideOn() {
		timer.tween(
			this.currentPokemon.position,
			{ x: TitleScreenState.POSITION.mid.x, y: TitleScreenState.POSITION.mid.y },
			0.5,
			Easing.linear,
			() => this.slideOff()
		);
	}

	slideOff() {
		timer.wait(1.5, () => {
			timer.tween(
				this.currentPokemon.position,
				{ x: TitleScreenState.POSITION.end.x, y: TitleScreenState.POSITION.end.y },
				0.5,
				Easing.linear,
				() => this.reset()
			);
		});
	}

	reset() {
		this.currentPokemon.position.set(
			TitleScreenState.POSITION.start.x,
			TitleScreenState.POSITION.start.y
		);
		this.currentPokemon = this.pokemon[this.getNextIndex()];
	}

	play() {
		TransitionState.fade(() => {
			stateStack.pop();
			stateStack.push(this.playState);
		});
	}
}
