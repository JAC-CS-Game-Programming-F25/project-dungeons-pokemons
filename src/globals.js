import Fonts from "../lib/Fonts.js";
import Input from "../lib/Input.js";
import Images from "../lib/Images.js";
import Sounds from "../lib/Sounds.js";
import StateStack from "../lib/StateStack.js";
import Timer from "../lib/Timer.js";
import PokemonFactory from "./services/PokemonFactory.js";
import Maps from "./services/sharedinstances/Maps.js";
import NPCs from "./services/sharedinstances/NPCs.js";
import Objects from "./services/sharedinstances/Objects.js";

export const canvas = document.createElement("canvas");
export const context = canvas.getContext("2d") || new CanvasRenderingContext2D();
export const CANVAS_WIDTH = 240;
export const CANVAS_HEIGHT = 176;
export const OFFSET_X = 7;
export const OFFSET_Y = 5;

const resizeCanvas = () => {
	const scaleX = window.innerWidth / CANVAS_WIDTH;
	const scaleY = window.innerHeight / CANVAS_HEIGHT;
	const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

	canvas.style.width = `${CANVAS_WIDTH * scale}px`;
	canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

// Listen for canvas resize events
window.addEventListener("resize", resizeCanvas);

resizeCanvas(); // Call once to scale initially

export const objects = new Objects();
export const npcs = new NPCs();
export const maps = new Maps();
export const images = new Images(context);
export const fonts = new Fonts();
export const input = new Input(canvas);
export const stateStack = new StateStack();
export const timer = new Timer();
export const sounds = new Sounds();

export const pokemonFactory = new PokemonFactory();

export const DEBUG = false;
