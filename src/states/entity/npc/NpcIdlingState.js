import Animation from "../../../../lib/Animation.js";
import { getRandomPositiveInteger } from "../../../../lib/Random.js";
import State from "../../../../lib/State.js";
import NPC from "../../../entities/NPC.js";
import NpcStateName from "../../../enums/entities/state/NpcStateName.js";
import { timer } from "../../../globals.js";

export default class NpcIdlingState extends State {
	static MOVE_DURATION_MIN = 3;
	static MOVE_DURATION_MAX = 8;

	/**
	 * In this state, the enemy does not move and
	 * starts moving after a random period of time.
	 *
	 * @param {NPC} npc
	 * @param {Animation} animation
	 */
	constructor(npc, animation, willMove) {
		super();

		this.npc = npc;
		this.animation = animation;

		// basically if the npc does move within the map, it will start a timer.
		// We don't need to start the timer if the npc is stationary and does not have a walking state
		this.moves = willMove;
	}

	enter() {
		this.npc.currentAnimation = this.animation[this.npc.direction];
		this.idleDuration = getRandomPositiveInteger(
			NpcIdlingState.MOVE_DURATION_MIN,
			NpcIdlingState.MOVE_DURATION_MAX
		);

		if (this.moves) this.startTimer();
	}

	/**
	 * This timer has a random duration is for how long the npc wont move
	 */
	async startTimer() {
		await timer.waitAsync(this.idleDuration);

		this.npc.changeState(NpcStateName.Moving);
	}
}
