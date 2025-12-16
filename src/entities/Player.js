import GameEntity from "./GameEntity.js";
import { images, pokemonFactory, sounds, timer } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/entity/player/PlayerWalkingState.js";
import PlayerIdlingState from "../states/entity/player/PlayerIdlingState.js";
import PlayerStateName from "../enums/entities/state/PlayerStateName.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import { pickRandomElement } from "../../lib/Random.js";
import Character_Run from "../enums/entities/player/Character_Run.js";
import PokemonName from "../enums/entities/PokemonName.js";
import Map from "../services/Map.js";
import Pokemon from "./Pokemon.js";
import Move from "../services/Moves.js";
import TypeEffectiveness from "../services/TypeEffectiveness.js";
import Inventory from "../services/Inventory.js";
import Weapon from "../objects/equipment/Weapon.js";
import Armor from "../objects/equipment/Armor.js";
import Character_Idle from "../enums/entities/player/Character_Idle.js";
import Animation from "../../lib/Animation.js";
import Character_Fight from "../enums/entities/player/Character_fight.js";
import SoundName from "../enums/SoundName.js";
import EquipmentFactory from "../services/EquipmentFactory.js";
import Direction from "../enums/Direction.js";
import Tile from "../services/Tile.js";

export default class Player extends GameEntity {
	static BATTLE_POSITION = {
		sprite: 0,
		start: { x: -160, y: 60 },
		end: { x: 40, y: 60 },
		attack: { x: 100, y: 120 },
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
		this.walkingSprites = this.initializeSprites(Character_Run);
		this.idleSprites = this.initializeSprites(Character_Idle);
		this.battleSprites = this.idleSprites[3];
		this.attackSprites = this.initializeFightSprites(Character_Fight.Attack, 32, 48);
		this.hitSprites = this.initializeFightSprites(
			Character_Fight.Hit,
			GameEntity.WIDTH,
			GameEntity.WIDTH
		);
		this.sprites = this.idleSprites[this.direction];
		this.stateMachine = this.initializeStateMachine();
		this.party = this.initializeParty();
		this.currentAnimation = this.stateMachine.currentState.animation[this.direction];
		this.velocity = new Vector(0, 0);

		this.inventory = new Inventory(entityDefinition.inventory) ?? Inventory();
		this.equippedWeapon =
			entityDefinition.weapon ??
			new Weapon({
				type: "Weapon",
				name: "Some stick",
				description: "a very old and dull stick",
				effect: {},
				value: 5,
				elementalType: "Normal",
			});
		this.equippedArmor =
			entityDefinition.armor ??
			new Armor({
				type: "Armor",
				name: "Cloth Clothes",
				description: "smelly",
				effect: {},
				value: 5,
				elementalType: "Normal",
			});

		// This is how the player will carry items

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
		this.fainted = false;

		// For now the player only has one move
		this.move = new Move("Lethal Strike", { type: "Normal", basePower: 50 });
	}

	update(dt) {
		super.update(dt);
		this.currentAnimation.update(dt);

		this.currentFrame = this.currentAnimation.currentFrame;
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

	initializeSprites(type) {
		const sprites = [];

		sprites.push(
			Sprite.generateSpritesFromSpriteSheet(
				images.get(type.Up),
				GameEntity.WIDTH,
				GameEntity.HEIGHT
			)
		);

		sprites.push(
			Sprite.generateSpritesFromSpriteSheet(
				images.get(type.Down),
				GameEntity.WIDTH,
				GameEntity.HEIGHT
			)
		);

		sprites.push(
			Sprite.generateSpritesFromSpriteSheet(
				images.get(type.Left),
				GameEntity.WIDTH,
				GameEntity.HEIGHT
			)
		);

		sprites.push(
			Sprite.generateSpritesFromSpriteSheet(
				images.get(type.Right),
				GameEntity.WIDTH,
				GameEntity.HEIGHT
			)
		);

		return sprites;
	}

	initializeFightSprites(spriteSheet, width, height) {
		return Sprite.generateSpritesFromSpriteSheet(images.get(spriteSheet), width, height);
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

	static initializePlayer() {
		const playerData = JSON.parse(localStorage.getItem("playerData"));

		if (playerData === null) return null;

		const newInventory = {};

		for (const [category, items] of Object.entries(playerData.inventory)) {
			newInventory[category] = items.map((item) => EquipmentFactory.createInstance(item));
		}

		playerData.inventory = newInventory;

		return playerData;
	}

	heal(amount = this.maxHealth) {
		this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
	}

	revive() {
		this.fainted = false;
		const savedData = Player.initializePlayer();

		this.position = savedData !== null ? savedData.position : new Vector(19, 22);
		this.inventory = savedData !== null ? savedData.inventory : new Inventory();
		this.direction = savedData !== null ? savedData.direction : Direction.Up;
		this.level = savedData !== null ? savedData.level : 1;

		this.canvasPosition = new Vector(
			Math.floor(this.position.x * Tile.SIZE),
			Math.floor(this.position.y * Tile.SIZE)
		);

		this.calculateStats();
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
		this.attack = this.calculateStat(this.baseAttack) + this.equippedWeapon.value;
		this.defense = this.calculateStat(this.baseDefense) + this.equippedArmor.value;
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
		this.sprites = this.battleSprites;
		this.currentAnimation = new Animation(this.sprites, 0.15);
		this.currentFrame = position.sprite;
		this.canvasPosition.set(position.start.x, position.start.y);
		this.battlePosition.set(position.end.x, position.end.y);
		this.attackPosition.set(position.attack.x, position.attack.y);
	}

	attackAnimation(reverse = false) {
		this.sprites = reverse ? this.attackSprites.toReversed() : this.attackSprites;
		this.currentAnimation = new Animation(this.sprites, 0.075, 1);
		this.canvasPosition.y -= 16;
		sounds.play(SoundName.Swing);
		timer.wait(0.3, () => {
			this.canvasPosition.y += 16;
			this.sprites = this.battleSprites;
			this.currentAnimation = new Animation(this.sprites, 0.15);
		});
	}

	gotHit() {
		this.sprites = this.hitSprites;
		this.currentAnimation = new Animation(this.sprites, 0.1, 1);
		timer.wait(0.2, () => {
			this.sprites = this.battleSprites;
			this.currentAnimation = new Animation(this.sprites, 0.1);
		});
	}
}
