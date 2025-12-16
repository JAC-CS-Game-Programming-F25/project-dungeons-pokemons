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
export const CANVAS_WIDTH = 240;
export const CANVAS_HEIGHT = 176;
export const OFFSET_X = 7;
export const OFFSET_Y = 5;
export const context = setupCanvas(canvas);

function setupCanvas(canvas) {
	const dpr = window.devicePixelRatio || 1;

	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	canvas.style.width = `${CANVAS_WIDTH}px`;
	canvas.style.height = `${CANVAS_HEIGHT}px`;

	// Prevent CSS smoothing
	canvas.style.imageRendering = "pixelated";
	canvas.style.imageRendering = "-moz-crisp-edges";
	canvas.style.imageRendering = "crisp-edges";

	const ctx = canvas.getContext("2d");
	// ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// Prevent canvas smoothing
	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;

	return ctx;
}

const resizeCanvas = () => {
	const scaleX = Math.floor(window.innerWidth / CANVAS_WIDTH);
	const scaleY = Math.floor(window.innerHeight / CANVAS_HEIGHT);
	const scale = Math.max(1, Math.min(scaleX, scaleY));

	canvas.style.width = `${CANVAS_WIDTH * scale}px`;
	canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

resizeCanvas(); // Call once to scale initially

// Listen for canvas resize events
window.addEventListener("resize", resizeCanvas);

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
