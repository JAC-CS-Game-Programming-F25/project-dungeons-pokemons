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
		this.player = new Player(
			JSON.parse(localStorage.getItem("playerData")) ?? { position: new Vector(7, 5) },
			this.map
		);
		this.map.player = this.player;

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

		// Here 600 is the value for "semiBold"
		context.font = "500 40px CormorantUnicase";
		context.textAlign = "center";
		context.fillStyle = Colour.White;
		context.fillText("Dungeons & Pokemons", CANVAS_WIDTH / 2, 100);
		context.font = "600 35px CormorantUnicase";
		context.fillStyle = Colour.Gold;
		context.fillText("Remastered", CANVAS_WIDTH / 2 + 8, 150);
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

	play() {
		TransitionState.fade(() => {
			stateStack.pop();
			stateStack.push(this.playState);
		});
	}
}
