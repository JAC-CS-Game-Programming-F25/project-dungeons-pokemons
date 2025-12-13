import GameEntity from "./GameEntity.js";
import { getRandomPositiveInteger } from "../../lib/Random.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import { CANVAS_WIDTH, context, images, timer } from "../globals.js";
import Move from "../services/Moves.js";
import TypeEffectiveness from "../services/TypeEffectiveness.js";
import Easing from "../../lib/Easing.js";

export default class Pokemon extends GameEntity {
	static FRONT_POSITION = {
		sprite: 0,
		start: { x: 480, y: 30 },
		end: { x: 280, y: 30 },
		attack: { x: 260, y: 30 },
	};
	static BACK_POSITION = {
		sprite: 1,
		start: { x: -160, y: 96 },
		end: { x: 30, y: 96 },
		attack: { x: 50, y: 96 },
	};
	static LOW_HEALTH_THRESHOLD = 0.25;
	static MERCY_NEEDED = 100;

	//MYUPDATES
	static moveData = null; // this will get the moves.json data

	static setMoveData(data) {
		//Initializes once upon PokemonFactory setup
		Pokemon.moveData = data;
	}

	/**
	 * The titular monster/creature that the whole game is
	 * based around. A Pokemon is nothing more than a box of
	 * numbers at the end of the day. One Pokemon's numbers
	 * are compared to another Pokemon's numbers, and things
	 * happen as a result. It's really a genius concept!
	 *
	 * @param {object} definition Defined in config/pokemon.json.
	 * @param {number} level
	 */
	constructor(name, definition, level) {
		super();

		this.name = name;
		this.level = level;
		this.position = new Vector();
		this.battlePosition = new Vector();
		this.attackPosition = new Vector();

		this.battleSprites = [
			new Sprite(images.get(`${this.name.toLowerCase()}-front`), 0, 0, 160, 160),
			new Sprite(images.get(`${this.name.toLowerCase()}-back`), 0, 0, 160, 160),
		];
		this.iconSprites = [
			new Sprite(images.get(`${this.name.toLowerCase()}-icon`), 0, 0, 64, 64),
			new Sprite(images.get(`${this.name.toLowerCase()}-icon`), 64, 0, 64, 64),
		];
		this.sprites = this.battleSprites;

		this.baseHealth = definition.baseHealth;
		this.baseAttack = definition.baseAttack;
		this.baseDefense = definition.baseDefense;
		this.baseSpeed = definition.baseSpeed;
		this.baseExperience = definition.baseExperience;

		// MYUPDATES
		this.type = definition.type;
		this.initializeIndividualValues();

		// This initializes the moves for the specific pokemon //MYUPDATE
		this.moves = this.initializePokemonMoves(definition.starterMoves);

		// Old Stats MYUPDATE
		this.oldHealth = 0;
		this.oldAttack = 0;
		this.oldDefense = 0;
		this.oldSpeed = 0;

		this.health = 0;
		this.attack = 0;
		this.defense = 0;
		this.speed = 0;

		// This is used for the spared mechanic
		this.mercyMeter = 0;

		this.calculateStats();

		this.targetExperience = this.experienceFromLevel(level + 1);
		this.currentExperience = this.experienceFromLevel(level);
		this.levelExperience = this.experienceFromLevel(level);

		this.currentHealth = this.health;

		// Used to flash the Pokemon when taking damage.
		this.alpha = 1;
	}

	render() {
		context.save();
		context.globalAlpha = this.alpha;
		super.render(this.position.x, this.position.y);
		context.restore();
	}

	/**
	 * @see https://bulbapedia.bulbagarden.net/wiki/Individual_values
	 */
	initializeIndividualValues() {
		this.healthIV = getRandomPositiveInteger(0, 31);
		this.attackIV = getRandomPositiveInteger(0, 31);
		this.defenseIV = getRandomPositiveInteger(0, 31);
		this.speedIV = getRandomPositiveInteger(0, 31);
	}

	// this will intialize the moves by checking if pokemon starter move
	// is within the moves.json
	initializePokemonMoves(pokemonMoves) {
		//MYUPDATE
		if (!pokemonMoves || !Pokemon.moveData) {
			return [];
		}

		return pokemonMoves.slice(0, 4).map((moveName) => {
			const pokemonMoveDefinition = Pokemon.moveData[moveName];
			if (pokemonMoveDefinition) {
				return new Move(moveName, pokemonMoveDefinition);
			}
			// Fallback for unknown moves
			return new Move("Tackle", { type: "Normal", basePower: 40 });
		});
	}

	/**
	 * Get a random move for the opponent to use.
	 * @returns {Move} A randomly selected move.
	 */
	getRandomMove() {
		if (this.moves.length === 0) {
			// Fallback move if no moves available
			return new Move("Tackle", { type: "Normal", basePower: 40 });
		}
		const randomIndex = Math.floor(Math.random() * this.moves.length);
		return this.moves[randomIndex];
	}

	/**
	 * The "front" sprite is usually the opponent's sprite
	 * in a battle. This could also be used in the Pokedex
	 * or when evolving as well. The "back" sprite is usually
	 * the player's sprite in a battle.
	 *
	 * @param {object} position Pokemon.FRONT_POSITION or Pokemon.BACK_POSITION.
	 */
	prepareForBattle(position) {
		this.sprites = this.battleSprites;
		this.currentFrame = position.sprite;
		this.position.set(position.start.x, position.start.y);
		this.battlePosition.set(position.end.x, position.end.y);
		this.attackPosition.set(position.attack.x, position.attack.y);
	}

	levelUp() {
		// upon level up, store old stats //MYUPDATE
		this.oldHealth = this.health;
		this.oldAttack = this.attack;
		this.oldDefense = this.defense;
		this.oldSpeed = this.speed;

		this.level++;
		this.levelExperience = this.experienceFromLevel(this.level);
		this.targetExperience = this.experienceFromLevel(this.level + 1);

		return this.calculateStats();
	}

	/**
	 * @returns Using the Medium Fast formula.
	 * @see https://bulbapedia.bulbagarden.net/wiki/Experience#Medium_Fast
	 */
	experienceFromLevel(level) {
		return level === 1 ? 0 : level * level * level;
	}

	/**
	 * @param {Pokemon} opponent
	 * @returns The amount of experience to award the Pokemon that defeated this Pokemon.
	 * @see https://bulbapedia.bulbagarden.net/wiki/Experience#Gain_formula
	 */
	calculateExperienceToAward(opponent) {
		return Math.round((opponent.baseExperience * opponent.level) / 7);
	}

	heal(amount = this.health) {
		this.currentHealth = Math.min(this.health, this.currentHealth + amount);
	}

	isLowHealth() {
		const percentage = this.currentHealth / this.health;

		return percentage <= Pokemon.LOW_HEALTH_THRESHOLD && percentage > 0;
	}

	/**
	 * @see https://bulbapedia.bulbagarden.net/wiki/Individual_values
	 */
	calculateStats() {
		this.health = this.calculateHealth();
		// current health should be max health whenever pokemon level's up
		this.currentHealth = this.health; // MYUPDATE
		this.attack = this.calculateStat(this.baseAttack, this.attackIV);
		this.defense = this.calculateStat(this.baseDefense, this.defenseIV);
		this.speed = this.calculateStat(this.baseSpeed, this.speedIV);
	}

	calculateHealth() {
		return (
			Math.floor(((2 * this.baseHealth + this.healthIV) * this.level) / 100) + this.level + 10
		);
	}

	calculateStat(base, iv) {
		return Math.floor(((2 * base + iv) * this.level) / 100) + 5;
	}

	/**
	 * @param {Pokemon} defender
	 * @param {Move} move The move being used.
	 * @see https://bulbapedia.bulbagarden.net/wiki/Damage
	 */
	inflictDamage(defender, move = null) {
		// In here this will provide the necessary health points removed based on
		// attack points
		const power = move ? move.basePower : 40; //MYUPDATE
		const moveType = move ? move.type : "Normal"; //MYUPDATE - safe access

		const getMutiplier = TypeEffectiveness.getMultiplier(moveType, defender.type);
		const damage = Math.max(
			1,
			Math.floor(
				(((2 * this.level) / 5 + 2) * power * (this.attack / defender.defense)) / 50 + 2
			) * getMutiplier
		);

		defender.currentHealth = Math.max(0, defender.currentHealth - damage);
		return getMutiplier;
	}

	getHealthMeter() {
		return `${Math.floor(this.currentHealth)} / ${this.health}`;
	}
	getHealthPercentage() {
		//MYUPDATE
		return this.currentHealth / this.health;
	}

	getExperienceMeter() {
		return `${Math.floor(this.currentExperience - this.levelExperience)} / ${
			this.targetExperience - this.levelExperience
		}`;
	}

	spare() {
		// Twinkle animation

		// tween to the right
		timer.tween(this.canvasPosition, { x: CANVAS_WIDTH }, 0.5, Easing.easeOutQuad);
	}
}
