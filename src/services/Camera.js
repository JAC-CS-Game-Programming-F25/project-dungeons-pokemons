import { CameraSettings } from "../../config/CameraConfig.js";
import { PlayerConfig } from "../../config/PlayerConfig.js";
import Vector from "../../lib/Vector.js";

export default class Camera {
	constructor(player, viewportWidth, viewportHeight, worldWidth, worldHeight) {
		this.player = player;
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;

		this.position = new Vector(0, viewportHeight);
		this.center = new Vector(viewportWidth / 2, viewportHeight / 2);
		this.lookahead = new Vector(0, 0);

		this.targetLookaheadY = 0;

		this.lastGroundedY = 0;
		this.verticalDeadzone = viewportHeight / 2;
	}

	update(dt) {
		const playerCenter = new Vector(
			this.player.canvasPosition.x + this.player.dimensions.x / 2,
			this.player.canvasPosition.y + this.player.dimensions.y / 2
		);

		let currentDirectionX = 0;
		let isMoving = false;

		if (Math.abs(this.player.velocity.x) > 0.1) {
			currentDirectionX = this.player.velocity.x > 0 ? 1 : -1;
			isMoving = true;
		}

		const playerSpeedX = Math.abs(this.player.velocity.x);
		const maxSpeedX = PlayerConfig.maxSpeed;
		const speedRatioX = Math.min(playerSpeedX / maxSpeedX, 1);

		// Calculate target lookahead position
		let targetLookaheadX = isMoving
			? CameraSettings.lookahead * speedRatioX * currentDirectionX
			: 0;

		// Update lastGroundedY when player lands
		if (this.player.isOnGround) {
			this.lastGroundedY = playerCenter.y;
		}

		// Calculate vertical camera adjustment
		let verticalAdjustment = 0;
		if (Math.abs(playerCenter.y - this.lastGroundedY) > this.verticalDeadzone) {
			verticalAdjustment = playerCenter.y - this.lastGroundedY;
		}

		// Calculate target camera position
		const target = new Vector(
			playerCenter.x + targetLookaheadX - this.center.x,
			this.lastGroundedY + verticalAdjustment + this.targetLookaheadY - this.center.y
		);

		if (CameraSettings.damping > 0) {
			// Use exponential smoothing for camera movement
			const smoothFactor = 1 - Math.exp(-CameraSettings.damping * dt);
			this.position.x += (target.x - this.position.x) * smoothFactor;
			this.position.y += (target.y - this.position.y) * smoothFactor;

			// Apply smoothing to lookahead
			this.lookahead.x += (targetLookaheadX - this.lookahead.x) * smoothFactor;
			this.lookahead.y += (this.targetLookaheadY - this.lookahead.y) * smoothFactor;
		} else {
			// Snap to target positions if damping is zero
			this.position.x = target.x;
			this.position.y = target.y;
			this.lookahead.x = targetLookaheadX;
			this.lookahead.y = this.targetLookaheadY;
		}

		// Ensure camera stays within world bounds
		this.position.x = Math.max(
			0,
			Math.min(this.worldWidth - this.viewportWidth, this.position.x)
		);
		this.position.y = Math.max(
			0,
			Math.min(this.worldHeight - this.viewportHeight, this.position.y)
		);

		// Round camera position to prevent sub-pixel rendering
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
	}

	applyTransform(context) {
		context.save();
		context.translate(-this.position.x, -this.position.y);
	}

	resetTransform(context) {
		context.restore();
	}

	getLookaheadPosition() {
		return {
			x: this.center.x + this.lookahead.x,
			y: this.center.y + this.lookahead.y,
		};
	}
}
