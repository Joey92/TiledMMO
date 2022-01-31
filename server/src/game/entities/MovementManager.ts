import { Point } from 'navmesh';
import Unit from './Unit';
import Victor from 'victor';

export enum MovementState {
	IDLE = 1,
	MOVING,
}

export default class MovementManager {
	private readonly owner: Unit;
	private waypoints: Victor[];
	private currentDestination?: Victor;
	private state: MovementState;
	constructor(unit: Unit) {
		this.owner = unit;
		this.state = MovementState.IDLE;
		this.waypoints = [];
	}

	update(diff: number) {
		if (!this.currentDestination) {
			return;
		}

		const currentPos = this.owner.getPosition();

		const velocity = (this.owner.getMaxSpeed() / 1000) * diff;
		const dir = this.currentDestination
			.clone()
			.subtract(currentPos)
			.normalize()
			.multiplyScalar(velocity);

		const newPos = currentPos.add(dir);

		this.owner.setPosition(newPos.x, newPos.y);

		if (this.currentDestination.distance(this.owner.getPosition()) < 10) {
			// next waypoint
			this.currentDestination = this.waypoints.shift();

			if (!this.currentDestination) {
				console.log('NPC %d finished moving', this.owner.getGUID());
				this.state = MovementState.IDLE;
				return;
			}

			console.log('NPC goes to new waypoint', this.currentDestination);
		}
	}

	destination(p: Point) {
		const map = this.owner.getMapInstance();

		if (!map) {
			return;
		}

		console.log('Start movement for npc %d', this.owner.getGUID());
		this.waypoints = map
			.getMap()
			.findPath(this.owner.getPosition(), p)
			?.map((v) => new Victor(v.x, v.y)) || [];
		this.currentDestination = this.waypoints[0];
		this.state = MovementState.MOVING;
		console.log(this.waypoints);
	}

	getState() {
		return this.state;
	}

	stop() {
		this.waypoints = [];
		this.currentDestination = undefined;
	}
}
