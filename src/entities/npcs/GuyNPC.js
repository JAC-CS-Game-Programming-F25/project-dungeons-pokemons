import Vector from "../../../lib/Vector.js";
import NPC from "../NPC.js";
import Direction from "../../enums/Direction.js";
import Animation from "../../../lib/Animation.js";
import Panel from "../../user-interface/elements/Panel.js";
import { stateStack } from "../../globals.js";
import DialogueState from "../../states/game/DialogueState.js";

export default class GuyNPC extends NPC {
	constructor(entityDefinition, map) {
		const walkingAnimation = {
			[Direction.Up]: new Animation([3, 4, 5], 0.2),
			[Direction.Down]: new Animation([0, 1, 2], 0.2),
			[Direction.Left]: new Animation([6, 7, 8], 0.2),
			[Direction.Right]: new Animation([9, 10, 11], 0.2),
		};

		const idleAnimation = {
			[Direction.Up]: new Animation([4], 1),
			[Direction.Down]: new Animation([1], 1),
			[Direction.Left]: new Animation([7], 1),
			[Direction.Right]: new Animation([10], 1),
		};

		// Test for player collision spawning spot: x=2, y=1 (he might be angry tho)
		super(entityDefinition, map, walkingAnimation, idleAnimation);
	}

	dialogue(playerDirection) {
		super.dialogue(playerDirection);
		stateStack.push(
			new DialogueState(
				`Man I sure do love coding npcs and maps!
					I love having to add 10 files for them to work, \n\
					and have good reusability woo hoo! \n\
					*The man starts switching between uncontrollable laughter and sobbing*`,
				Panel.BOTTOM_DIALOGUE
			)
		);
	}
}
