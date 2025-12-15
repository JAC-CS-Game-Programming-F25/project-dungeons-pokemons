export default class TypeEffectiveness {
  static CHART = {
    Fire: {
      Fire: 1,
      Water: 0.5,
      Grass: 2,
      Normal: 1,
    },
    Water: {
      Fire: 2,
      Water: 1,
      Grass: 0.5,
      Normal: 1,
    },
    Grass: {
      Fire: 0.5,
      Water: 2,
      Grass: 1,
      Normal: 1,
    },
    Normal: {
      Fire: 1,
      Water: 1,
      Grass: 1,
      Normal: 1,
    },
  };

  /**
   * Get the damage multiplier based on move type and defender type.
   *
   * @param {string} moveType The type of the move being used.
   * @param {string} defenderType The type of the defending Pokémon.
   * @returns {number} The damage multiplier (0.5, 1, or 2).
   */
  static getMultiplier(moveType, defenderType) {
    // Default to 1x if types are not found
    if (!TypeEffectiveness.CHART[moveType]) {
      return 1;
    }

    return TypeEffectiveness.CHART[moveType][defenderType] ?? 1;
  }
}
