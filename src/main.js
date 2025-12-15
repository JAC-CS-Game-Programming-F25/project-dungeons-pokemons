/**
 * Pokémon-7
 * The "Polish" Update
 *
 * Original Lua by: Colton Ogden (cogden@cs50.harvard.edu)
 * Adapted to JS by: Vikram Singh (vikram.singh@johnabbott.qc.ca)
 *
 * Few franchises have achieved the degree of fame as Pokémon, short for "Pocket Monsters",
 * a Japanese monster-catching phenomenon that took the world by storm in the late 90s. Even
 * to this day, Pokémon is hugely successful, with games, movies, and various other forms of
 * merchandise selling like crazy. The game formula itself is an addicting take on the JRPG,
 * where the player can not only fight random Pokémon in the wild but also recruit them to
 * be in their party at all times, where they can level up, learn new abilities, and even evolve.
 *
 * This proof of concept demonstrates basic GUI usage, random encounters, and Pokémon that the
 * player can fight and defeat with their own Pokémon.
 *
 * All Assets
 * @see https://reliccastlearchive.neocities.org/
 */

import Game from "../lib/Game.js";
import TitleScreenState from "./states/game/TitleScreenState.js";
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	pokemonFactory,
	sounds,
	stateStack,
	timer,
	maps,
	npcs,
	objects,
} from "./globals.js";
import { Maps } from "./enums/MapNames.js";
import TransitionState from "./states/game/TransitionState.js";

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute("tabindex", "1"); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.appendChild(canvas);

const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch("./config/assets.json").then((response) => response.json());

// I get the map definitions here
const mapDefinition = await fetch("./config/map.json").then((response) => response.json());
const houseMapDefinition = await fetch("./config/house-map.json").then((response) =>
	response.json()
);

// Gets the npc definitions
const npcDefinitions = await fetch("./config/npcs.json").then((response) => response.json());

// Gets the object definitions
const objectDefinitions = await fetch("./config/objects.json").then((response) => response.json());

// I load them so they are accessible anywhere
maps.load({ house: houseMapDefinition, town: mapDefinition });
npcs.load(npcDefinitions);
objects.load(objectDefinitions);

const pokemonDefinitions = await fetch("./config/pokemon.json").then((response) => response.json());

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);
pokemonFactory.load(pokemonDefinitions);

// Add all the states to the state machine.

TransitionState.fade(() => {
	stateStack.push(new TitleScreenState(Maps.town));
});

const game = new Game(stateStack, context, timer, CANVAS_WIDTH, CANVAS_HEIGHT);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
