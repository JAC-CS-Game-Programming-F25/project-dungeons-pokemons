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
import EquipmentFactory from "../../services/EquipmentFactory.js";
import Selection from "../../user-interface/elements/Selection.js";
import Menu from "../../user-interface/elements/Menu.js";
import PanelOrientation from "../../enums/PanelOrientation.js";

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

		// I create the map within the title screen since I need to be able to pass the player instance to the map
		// This removes the issue of having a bunch of player instances in the game.

		const mapDefinition = maps.get(mapName);
		const options = [
			{
				text: "New Game",
				onSelect: () => {
					this.setData("New Game");
					this.play();
				},
			},
		];

		if (JSON.parse(localStorage.getItem("playerData")))
			options.push({
				text: "Continue",
				onSelect: () => {
					this.setData("Continue");
					this.play();
				},
			});

		this.map = new Map(mapDefinition, null, ImageName.Tiles, mapName);

		this.menu = new Menu(5.5, 8, 4, 2.5, options, PanelOrientation.Vertical, {
			borderColour: Colour.White,
			panelColour: Colour.Black,
		});
		// this.selection = new Selection(4, 8, 4, 3, options);
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
		this.menu.update();
	}

	render() {
		context.save();
		this.renderTitle();
		this.menu.render();
		context.restore();
	}

	renderTitle() {
		images.render(ImageName.Title, 0, 0);

		// Here 600 is the value for "semiBold"
		context.font = "500 20px CormorantUnicase";
		context.textAlign = "center";
		context.fillStyle = Colour.White;
		context.fillText("Dungeons & Pokemons", CANVAS_WIDTH / 2, 45);
		context.font = "600 15px CormorantUnicase";
		context.fillStyle = Colour.Gold;
		context.fillText("Remastered", CANVAS_WIDTH / 2, 65);
	}

	setData(option) {
		switch (option) {
			case "New Game": {
				localStorage.setItem("newGame", true);
				this.player = new Player({ position: new Vector(19, 22) }, this.map);
				this.map.player = this.player;
				break;
			}
			case "Continue": {
				localStorage.setItem("newGame", false);
				this.player = new Player(Player.initializePlayer(), this.map);
				this.map.player = this.player;
				break;
			}
		}

		this.playState = new PlayState(this.map);
	}

	play() {
		TransitionState.fade(() => {
			stateStack.pop();
			stateStack.push(this.playState);
		});
	}
}
