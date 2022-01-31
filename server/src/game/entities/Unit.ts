import UnitScript from '../AI/NPCAI';
import MovementManager, { MovementState } from './MovementManager';
import { server as ServerMsg } from '../../../proto';

import ThreadManager from './ThreadManager';
import CombatManager from './CombatManager';
import GameObject, { ObjectOpts } from './GameObject';
import Victor from 'victor';

const BASE_SPEED = 100;

interface Point {
	x: number;
	y: number;
}

enum UnitState {
	STANDING = 1,
}

enum UnitType {
	UNDEFINED = 1,
	HUMAN,
	UNDEAD,
}

export interface UnitOpts extends ObjectOpts {
	health?: number;
	maxHealth?: number;
	type?: UnitType;
	mana?: number;
	state?: UnitState;
}

export default class Unit extends GameObject {
	protected health: number;
	protected maxHealth: number;
	protected type: UnitType;
	protected mana?: number;
	protected state: UnitState;
	protected ai?: UnitScript;

	protected readonly spawnLocation: Victor;
	protected readonly movement: MovementManager;
	protected readonly combat: CombatManager;
	protected readonly thread: ThreadManager;

	constructor(opts: UnitOpts & ObjectOpts = {}) {
		super(opts)

		this.movement = new MovementManager(this);
		this.combat = new CombatManager(this);
		this.thread = new ThreadManager(this);

		this.spawnLocation = this.position.clone()
		this.health = opts.health || 100;
		this.maxHealth = opts.maxHealth || 100;
		this.type = opts.type || UnitType.UNDEFINED;
		this.mana = opts.mana || 100;
		this.state = opts.state || UnitState.STANDING;

	}

	update(diff: number) {
		this.movement.update(diff);

		this.ai?.update(diff);
	}

	moveToUnit(unit: Unit, now?: boolean) {
		if (!now && this.movement.getState() === MovementState.MOVING) {
			return this;
		}

		this.movement.destination(unit.getPosition());
		return this;
	}

	cancelMovement() {
		this.movement.stop();

		return this;
	}

	findNearestUnits(range: number) {
		return this.map ? this.map.getUnitsAroundMe(this, range) : [];
	}

	createUnitUpdate(entire: boolean = false) {
		if (!this.inWorld) {
			return;
		}

		const { x, y } = this.getPosition();
		if (entire) {
			const { name, mana, imageName, type, state } = this;
			this.updated = false;
			return ServerMsg.Unit.create({
				object: {
					guid: this.getGUID(),
					name,
					x,
					y,
					imageName,
				},
				mana,
				type,
				state,
			});
		}

		if (!this.updated) {
			return;
		}

		this.updated = false;
		return ServerMsg.Unit.create({
			object: {
				guid: this.getGUID(),
				x,
				y,
			}
		});
	}

	setAI(ai: UnitScript) {
		this.ai = ai;
		return this;
	}

	removeAI() {
		delete this.ai;
	}

	// Gets the max movements speed in pixes per sec
	getMaxSpeed() {
		return BASE_SPEED * this.speedMultiplier;
	}

	moveTo(p: Point) {
		this.movement.destination(p);
		return this;
	}

	getSpawnPosition() {
		return this.spawnLocation;
	}
}
