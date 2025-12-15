import Pokemon from "../entities/Pokemon.js";
import PokemonName from "../enums/entities/PokemonName.js";

export default class PokemonFactory {
	constructor(context) {
		this.context = context;
		this.pokemon = {};
		this.moves = {};
	}

	load(pokemonDefinitions, moveDefinition = {}) {
		this.pokemon = pokemonDefinitions;
		this.moves = moveDefinition;

		Pokemon.setMoveData(moveDefinition);

		Object.keys(pokemonDefinitions).forEach((name) => {
			PokemonName[name] = name;
		});
	}

	get(name) {
		return this.pokemon[name];
	}

	createInstance(name, level = 1) {
		return new Pokemon(name, this.pokemon[name], level);
	}
}
