import { NavMesh, Point } from 'navmesh';
import applyScript from '../AI/index';
import { encodeMessage } from '../network/opcodes';
import GameObject from './GameObject';
import NPC from './NPC';
import { UnitOpts } from './Unit';
import { server as ServerMsg } from '../../../proto'

export interface TileMap {
	compressionlevel: number;
	height: number;
	infinite: boolean;
	layers: Layer[];
	nextlayerid: number;
	nextobjectid: number;
	orientation: string;
	renderorder: string;
	tiledversion: string;
	tileheight: number;
	tilesets: Tileset[];
	tilewidth: number;
	type: string;
	version: string;
	width: number;
}

export interface Layer {
	data?: number[];
	height?: number;
	id?: number;
	name: string;
	opacity: number;
	properties?: Property[];
	type: string;
	visible: boolean;
	width?: number;
	x: number;
	y: number;
	draworder?: string;
	objects?: Object[];
}

export interface Object {
	height: number;
	id: number;
	name: string;
	properties?: Property[];
	rotation: number;
	point?: boolean;
	type: string;
	visible: boolean;
	width: number;
	x: number;
	y: number;
	ellipse?: boolean;
}

export interface Property {
	name: string;
	type: string;
	value: boolean | number | string;
}

export interface Tileset {
	columns: number;
	firstgid: number;
	image: string;
	imageheight: number;
	imagewidth: number;
	margin: number;
	name: string;
	spacing: number;
	tilecount: number;
	tileheight: number;
	tilewidth: number;
	tiles?: Tile[];
}

export interface Tile {
	id: number;
	objectgroup?: Objectgroup;
}

export interface Objectgroup {
	draworder: string;
	id?: number;
	name: string;
	objects: Object[];
	opacity: number;
	type: string;
	visible: boolean;
	x: number;
	y: number;
}

function getProperties<T>(properties: Property[]): T {
	return properties.reduce((acc, prop) => {
		acc[prop.name] = prop.value;
		return acc;
	}, {} as Record<string, any>) as T;
}

export default class Map {
	private static mapIDs: number = 0;

	private readonly id;
	private navmesh;
	private tiledMap: TileMap;
	private name: string

	constructor(name: string, map: TileMap) {
		this.id = Map.newMapID();
		this.name = name
		this.tiledMap = map;
		const NavMeshLayer = map.layers.find((l) => l.name === 'NavMesh');

		if (!NavMeshLayer) {
			throw new Error('Map has no NavMesh layer');
		}

		const meshPolygonPoints = NavMeshLayer.objects?.map((area) => [
			{ x: area.x, y: area.y },
			{ x: area.x + area.width, y: area.y },
			{ x: area.x + area.width, y: area.y + area.height },
			{ x: area.x, y: area.y + area.height },
		]);

		if (!meshPolygonPoints) {
			throw new Error('NavMesh layer has no object');
		}

		this.navmesh = new NavMesh(meshPolygonPoints);
	}

	private static newMapID() {
		return Map.mapIDs++;
	}

	findPath(start: Point, end: Point) {
		return this.navmesh.findPath(start, end);
	}

	extractObjects(phase: number = 0): GameObject[] {
		const objectLayers = this.tiledMap.layers.filter(l => l.type != 'objectgroup')

		if (objectLayers.length == 0) {
			return []
		}

		const layerInPhase = objectLayers.find((l => {
			if (!l.properties) {
				return false
			}

			const props = getProperties<{ phase?: number }>(l.properties)

			if (props.phase) {
				return props.phase === phase
			}

			return false
		}))

		if (!layerInPhase) {
			return []
		}

		if (!layerInPhase.objects) {
			return []
		}

		return layerInPhase.objects.flatMap(object => {
			switch (object.type) {
				case "PORTAL":
					if (!object.properties) {
						return
					}

					const props = getProperties<{ map?: string, x?: number, y?: number }>(object.properties)

					if (!props.x || !props.y || !props.map) {
						console.error("Map %s has an invalid portal with name %s", this.name, object.name)
						return
					}

					const obj = new GameObject({
						name: object.name,
						x: object.x,
						y: object.y
					})

					obj.onInteraction((p) => {
						p.sendDirectMessage(encodeMessage(ServerMsg.Map, {
							name: props.map,
							x: props.x,
							y: props.y
						}))
					})
					return obj
				default:
					return
			}
		}) as GameObject[]
	}

	extractNPCs(phase: number = 0) {


		const npclayer = this.tiledMap.layers.find((l) => l.name === 'NPCs');
		if (!npclayer) {
			return [];
		}

		if (!npclayer.objects) {
			return [];
		}

		return npclayer.objects
			.filter((objs) => objs.point)
			.map((obj) => {
				const props = obj.properties
					? getProperties<UnitOpts>(obj.properties)
					: {};

				const npc = new NPC({
					name: obj.name,
					x: obj.x,
					y: obj.y,
					...props,
				});

				if (obj.type !== '') {
					// create script
					const ai = applyScript(obj.type, npc);

					if (ai) {
						console.log(
							'Loaded script %s for npc %d',
							obj.type,
							npc.getGUID(),
						);
					}
				}

				return npc;
			});
	}

	getTileMap() {
		return this.tiledMap;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name
	}
}
