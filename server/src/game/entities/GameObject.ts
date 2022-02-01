import Victor from 'victor';
import MapInstance from './MapInstance';
import Player from './Player';
import { server as ServerMsg } from '../../../proto';
import { ObjectType, ObjectTypes } from '../../types';

export interface ObjectOpts {
	name?: string;
	x?: number;
	y?: number;
	imageName?: string;
	flags?: GameObjectFlags;
	height?: number;
	width?: number;
}

export enum GameObjectFlags {
	None = 0,
	Interactable = 1, // enable this if it should have interaction on the client
}

// GameObjects have a seperate GUID because of the protobuf messaging types
export type GUID = number | Long

export function extractGUIDnumber(guid: GUID): number {
	if (guid instanceof Number) {
		return guid as number
	}

	return (guid as Long).toNumber()
}

export default class GameObject implements ObjectType {

	public objectType = ObjectTypes.GAME_OBJECT;
	protected static guidCounter: number = 0;

	protected GUID: GUID;
	protected name: string;
	protected inWorld: boolean = false;
	protected imageName: string;
	protected updated: boolean = true;

	protected speedMultiplier: number = 1;
	protected map?: MapInstance;
	protected flags: GameObjectFlags;
	protected width?: number;
	protected height?: number;

	private interactionCallback?: (p: Player) => void

	protected readonly position: Victor;

	constructor(opts: ObjectOpts) {
		this.GUID = GameObject.newGUID();

		this.position = new Victor(opts.x || 0, opts.y || 0);

		this.imageName = opts.imageName || 'player_gfx';
		this.name = opts.name || 'unknown';
		this.flags = opts.flags !== undefined ? opts.flags : GameObjectFlags.None;

		this.width = opts.width
		this.height = opts.height
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

	createUpdate(full?: boolean): any {

		if (full) {
			return ServerMsg.GameObject.create({
				guid: this.getGUID(),
				x: this.position.x,
				y: this.position.y,
				name: this.name,
				flags: this.flags,
				width: this.width,
				height: this.height,
			})
		}

		if (!this.updated) {
			return
		}
		this.updated = false
		return ServerMsg.GameObject.create({
			guid: this.getGUID(),
			x: this.position.x,
			y: this.position.y
		})
	}
}