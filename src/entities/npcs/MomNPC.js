import Vector from "../../../lib/Vector.js";
import NPC from "../NPC.js";
import Direction from "../../enums/Direction.js";
import Animation from "../../../lib/Animation.js";
import Panel from "../../user-interface/elements/Panel.js";
import { stateStack } from "../../globals.js";
import DialogueState from "../../states/game/DialogueState.js";

export default class MomNPC extends NPC {
	constructor(entityDefinition, map) {
		const idleAnimation = {
			[Direction.Up]: new Animation([1], 1),
			[Direction.Down]: new Animation([0], 1),
			[Direction.Left]: new Animation([2], 1),
			[Direction.Right]: new Animation([3], 1),
		};

		// sets the position and direction of the mom made instantiated, no clue why
		// she faces forward when you enter the building tho
		entityDefinition["direction"] = Direction.Left;
		super(entityDefinition, map, null, idleAnimation);
	}

	dialogue(playerDirection) {
		super.dialogue(playerDirection);
		stateStack.push(
			new DialogueState(
				`So... when will you grow up and get out of your little computer cavern?\n\n\n\
					*Sigh* \n\n\
					Kids and their love for useless twisting of our new technologies...`,
				Panel.BOTTOM_DIALOGUE,
				() => {
					this.currentAnimation =
						this.stateMachine.currentState.animation[Direction.Left];
				}
			)
		);
	}
}
