import Victor from 'victor';
import MapInstance from './MapInstance';
import Player from './Player';
import { server as ServerMsg } from '../../../proto';

export interface ObjectOpts {
	name?: string;
	x?: number;
	y?: number;
	imageName?: string;
}

export enum GameObjectFlags {
	None = 0,
	Interactable = 1, // enable this if it should have interaction on the client
}

export default class GameObject {

	protected static guidCounter: number = 0;

	protected GUID: number;
	protected name: string;
	protected inWorld: boolean = false;
	protected imageName: string;
	protected updated: boolean = false;

	protected speedMultiplier: number = 1;
	protected map?: MapInstance;
	protected flags: GameObjectFlags

	private interactionCallback?: (p: Player) => void

	protected readonly position: Victor;

	constructor(opts: ObjectOpts) {
		this.GUID = GameObject.newGUID();

		this.position = new Victor(opts.x || 0, opts.y || 0);

		this.imageName = opts.imageName || 'player_gfx';
		this.name = opts.name || 'unknown';
		this.flags = GameObjectFlags.None
	}

	protected static newGUID() {
		return GameObject.guidCounter++;
	}

	getGUID() {
		return this.GUID;
	}

	setMap(map?: MapInstance) {
		this.map = map;
		return this;
	}


	getMapInstance() {
		return this.map;
	}

	getPosition() {
		return this.position;
	}

	setPosition(x: number, y: number) {
		this.position.x = x;
		this.position.y = y;
		this.updated = true;
		return this;
	}

	getName() {
		return this.name;
	}

	setInWorld(isInWorld: boolean) {
		this.inWorld = isInWorld;
		return this;
	}

	interactWith(p: Player) {
		if (!this.interactionCallback) {
			return
		}

		this.interactionCallback(p)
	}

	onInteraction(callback: (p: Player) => void) {
		this.interactionCallback = callback
	}

	createUpdate(full?: boolean) {
		if (!this.updated) {
			return
		}

		const update = {
			guid: this.getGUID(),
			x: this.position.x,
			y: this.position.y
		}

		if (full) {
			return ServerMsg.GameObject.create({
				...update,
				name: this.name,
			})
		}

		return ServerMsg.GameObject.create(update)
	}
}