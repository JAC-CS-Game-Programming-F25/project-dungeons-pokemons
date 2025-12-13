import GameEntity from "./GameEntity.js";
import { images, pokemonFactory } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/entity/player/PlayerWalkingState.js";
import PlayerIdlingState from "../states/entity/player/PlayerIdlingState.js";
import PlayerStateName from "../enums/entities/state/PlayerStateName.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import { pickRandomElement } from "../../lib/Random.js";
import Character from "../enums/entities/Character.js";
import PokemonName from "../enums/entities/PokemonName.js";
import Map from "../services/Map.js";
import Pokemon from "./Pokemon.js";
import Move from "../services/Moves.js";
import TypeEffectiveness from "../services/TypeEffectiveness.js";

export default class Player extends GameEntity {
	static BATTLE_POSITION = {
		sprite: 0,
		start: { x: -160, y: 96 },
		end: { x: 30, y: 96 },
		attack: { x: 50, y: 96 },
	};

	/**
	 * The character that the player controls in the map.
	 * Has a party of Pokemon they can use to battle other Pokemon.
	 *
	 * @param {object} entityDefinition
	 * @param {Map} map
	 */
	constructor(entityDefinition = {}, map = null) {
		super(entityDefinition);

		this.map = map;
		this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);
		this.stateMachine = this.initializeStateMachine();
		this.sprites = this.initializeSprites();
		this.party = this.initializeParty();
		this.currentAnimation = this.stateMachine.currentState.animation[this.direction];
		this.velocity = new Vector(0, 0);

		// This is how the player will carry items
		this.inventory = entityDefinition.inventory ?? [];

		this.name = entityDefinition.name || "John Doe";
		this.level = entityDefinition.level ?? 1;

		// Base Stats

		this.baseHealth = entityDefinition.baseHealth ?? 20;
		this.baseAttack = entityDefinition.baseAttack ?? 10;
		this.baseDefense = entityDefinition.baseDefense ?? 10;
		this.baseSpeed = entityDefinition.baseSpeed ?? 10;
		this.baseExperience = entityDefinition.baseExperience ?? 10;

		// Experience and Stats

		this.oldHealth = 0;
		this.oldAttack = 0;
		this.oldDefense = 0;
		this.oldSpeed = 0;

		this.maxHealth = 0;
		this.attack = 0;
		this.defense = 0;
		this.speed = 0;

		this.calculateStats();

		this.targetExperience = this.experienceFromLevel(this.level + 1);
		this.currentExperience = this.experienceFromLevel(this.level);
		this.levelExperience = this.experienceFromLevel(this.level);

		this.currentHealth = this.maxHealth;

		// Battle-related variables

		this.battlePosition = new Vector();
		this.attackPosition = new Vector();

		// For now the player only has one move
		this.move = new Move("Lethal Strike", { type: "Normal", basePower: 300 });
	}

	update(dt) {
		super.update(dt);
		this.currentAnimation.update(dt);

		this.currentFrame = this.currentAnimation.getCurrentFrame();
	}

	render(cameraEntity) {
		const x = Math.floor(this.canvasPosition.x);

		/**
		 * Offset the Y coordinate to provide a more "accurate" visual.
		 * To see the difference, remove the offset and bump into something
		 * either above or below the character and you'll see why this is here.
		 */
		const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

		super.render(x, y, cameraEntity);
	}

	initializeStateMachine() {
		const stateMachine = new StateMachine();

		stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
		stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));

		stateMachine.change(PlayerStateName.Idling);

		return stateMachine;
	}

	/**
	 * Normally, you wouldn't generate a random character sprite every time
	 * you made a new Player object. This is probably something the player
	 * would decide at the beginning of the game or in a settings menu.
	 */
	initializeSprites() {
		const character = pickRandomElement([
			Character.Red,
			Character.Green,
			Character.Brendan,
			Character.May,
		]);

		return Sprite.generateSpritesFromSpriteSheet(
			images.get(character),
			GameEntity.WIDTH,
			GameEntity.HEIGHT
		);
	}

	/**
	 * Right now there's only ever one Pokemon in the party, but this
	 * can be extended to contain more since it returns an array.
	 */
	initializeParty() {
		const pokemonName = pickRandomElement([
			PokemonName.Bulbasaur,
			PokemonName.Charmander,
			PokemonName.Squirtle,
		]);
		const pokemon = pokemonFactory.createInstance(pokemonName);

		return [pokemon];
	}

	healParty() {
		this.party.forEach((pokemon) => {
			pokemon.heal();
		});
	}

	//#region Experience and Leveling

	levelUp() {
		// upon level up, store old stats
		this.oldHealth = this.maxHealth;
		this.oldAttack = this.attack;
		this.oldDefense = this.defense;
		this.oldSpeed = this.speed;

		this.level++;
		this.levelExperience = this.experienceFromLevel(this.level);
		this.targetExperience = this.experienceFromLevel(this.level + 1);

		return this.calculateStats();
	}

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

	//#endregion

	//#region Stats Calculation
	calculateStats() {
		this.maxHealth = this.calculateHealth();

		// current health should increase by the difference upon level up
		this.currentHealth += this.maxHealth - this.oldHealth;
		this.attack = this.calculateStat(this.baseAttack);
		this.defense = this.calculateStat(this.baseDefense);
		this.speed = this.calculateStat(this.baseSpeed);
	}

	calculateHealth() {
		return Math.floor((2 * this.baseHealth * this.level) / 100) + this.level + 10;
	}

	calculateStat(base) {
		return Math.floor((2 * base * this.level) / 100) + 5;
	}

	//#endregion

	//#region Get Meters
	getHealthMeter() {
		return `${Math.floor(this.currentHealth)} / ${this.maxHealth}`;
	}

	getHealthPercentage() {
		//MYUPDATE
		return this.currentHealth / this.health;
	}
	//#endregion

	/**
	 *
	 * @param {Pokemon} defender
	 * @param {*} move
	 * @returns
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

	prepareForBattle(position) {
		// Copies the value of the old position
		// this.oldPosition = { ...this.position };
		// this.sprites = this.battleSprites;
		this.currentFrame = position.sprite;
		this.canvasPosition.set(position.start.x, position.start.y);
		this.battlePosition.set(position.end.x, position.end.y);
		this.attackPosition.set(position.attack.x, position.attack.y);
	}
}
