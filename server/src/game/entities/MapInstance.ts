import TileMap from './Map';
import Player from './Player';
import Unit from './Unit';
import Timer from '../utils/timer';
import { encodeMessage } from '../network/opcodes';
import GameObject, { GUID } from './GameObject';
import { server as ServerMsg } from '../../../proto'
import NPC from './NPC';
import { ObjectTypes } from '../../types';
import { DateTime } from 'luxon'

export default class MapInstance {
	private static GUIDs: number = 0;

	private readonly guid: number;
	protected readonly map: TileMap;
	private units = new Map<GUID, Unit>();
	private objects = new Map<GUID, GameObject>();
	private players = new Map<GUID, Player>();
	private phase: number;
	public readonly expiresAt?: DateTime

	// send unit updates only every 100 ms
	private unitUpdatesTimer = new Timer(100);

	constructor(map: TileMap, phase: number = 0, expire?: DateTime) {
		this.map = map;
		this.phase = phase

		this.guid = MapInstance.newGUID();

		this.units.forEach((u) =>
			console.log(
				'npc %d has been added to the map %s',
				u.getGUID(),
				map.getId(),
			)
		);

		this.expiresAt = expire

		this.map.extractObjects(this.phase).forEach((object) => {
			switch (object.objectType) {
				case ObjectTypes.NPC:
					this.addUnit(object as NPC)
					break;
				case ObjectTypes.GAME_OBJECT:
					this.addGameObject(object)
					break;
				default:
					return
			}
		})

		this.objects
			.forEach((go) => console.log(
				'Added object %s (guid %d) to map instance %d (map: %s)',
				go.getName(), go.getGUID(), this.getGUID(), this.getMap().getName())
			)
	}

	private static newGUID() {
		return MapInstance.GUIDs++;
	}

	getGUID() {
		return this.guid;
	}

	update(diff: number) {
		this.units.forEach((u) => u.update(diff));

		this.unitUpdatesTimer.update(diff);
		if (this.unitUpdatesTimer.passed()) {
			this.sendUnitUpdates();
			this.sendPlayerUpdates();
			this.sendGameObjectUpdates()
			this.unitUpdatesTimer.reset();
		}
	}

	getMap() {
		return this.map;
	}

	addGameObject(go: GameObject) {
		go.setInWorld(true)
		go.setMap(this)
		this.objects.set(go.getGUID(), go)
		return this
	}

	removeGameObject(go: GameObject) {
		go.setInWorld(false)
		go.setMap(undefined)
		this.objects.delete(go.getGUID())
		return this
	}

	addUnit(unit: Unit) {
		unit.setInWorld(true)
		unit.setMap(this)
		this.units.set(unit.getGUID(), unit);
		return this;
	}

	removeUnit(unit: Unit) {
		unit.setInWorld(false)
		unit.setMap(undefined)
		this.units.delete(unit.getGUID());
		return this;
	}

	getGameObjectsArray() {
		return Array.from(this.objects.values());
	}

	getPlayersArray() {
		return Array.from(this.players.values());
	}

	getUnitsArray() {
		return Array.from(this.units.values());
	}

	getUnit(guid: GUID) {
		return this.units.get(guid)
	}

	getPlayer(guid: GUID) {
		return this.players.get(guid)
	}

	getGameObject(guid: GUID) {
		return this.objects.get(guid)
	}

	sendGameObjectUpdates() {
		const gameobjects = this.getUnitsArray()
			.map((unit) => unit.createUpdate())
			.filter((u) => u);

		if (gameobjects.length == 0) {
			return
		}

		this.getPlayersArray().forEach((p) =>
			p.sendDirectMessage(
				encodeMessage(ServerMsg.GameObjectList, {
					objects: gameobjects,
				}),
			)
		);
	}

	sendUnitUpdates() {
		const unitStates = this.getUnitsArray()
			.map((unit) => unit.createUpdate())
			.filter((u) => u);

		if (unitStates.length == 0) {
			return
		}

		this.getPlayersArray().forEach((p) =>
			p.sendDirectMessage(
				encodeMessage(ServerMsg.UnitList, {
					units: unitStates,
				}),
			)
		);
	}

	sendPlayerUpdates() {
		const unitStates = this.getPlayersArray()
			.map((p) => p.createUpdate())
			.filter((u) => u);

		if (unitStates.length == 0) {
			return
		}

		this.getPlayersArray().forEach((p) =>
			p.sendDirectMessage(
				encodeMessage(ServerMsg.UnitList, {
					units: unitStates.filter((u) => u?.object?.guid !== p.getGUID()), // filter out the player himself
				}),
			)
		);
	}

	addPlayerToMap(player: Player) {
		player.setMap(this);

		player.sendDirectMessage(encodeMessage(ServerMsg.Map, {
			name: this.getMap().getName(),
			x: player.getPosition().x,
			y: player.getPosition().y
		}))

		const unitStates = [...this.getUnitsArray(), ...this.getPlayersArray()]
			.map((unit) => unit.createUpdate(true))
			.filter((u) => u);

		if (unitStates.length != 0) {
			player.sendDirectMessage(
				encodeMessage(ServerMsg.UnitList, {
					units: unitStates,
				}),
			);
		}

		const gameObjectStates = this.getGameObjectsArray()
			.map((go) => go.createUpdate(true))
			.filter((u) => u);

		if (gameObjectStates.length > 0) {
			player.sendDirectMessage(
				encodeMessage(ServerMsg.GameObjectList, {
					objects: gameObjectStates,
				}),
			);
		}

		player.setInWorld(true); // set in world so updates will be created
		// send the other players a full update of us
		const pUpdate = player.createUpdate(true);
		if (pUpdate) {
			this.getPlayersArray().forEach((otherPlayer) =>
				otherPlayer.sendDirectMessage(
					encodeMessage(ServerMsg.Unit, pUpdate),
				)
			);
		}

		this.players.set(player.getGUID(), player);
	}

	removePlayerFromMap(player: Player) {
		player.setInWorld(false);
		this.players.delete(player.getGUID());
		player.setMap(undefined);
		this.getPlayersArray().forEach((otherPlayer) =>
			otherPlayer.sendDirectMessage(
				encodeMessage(ServerMsg.Despawn, {
					guid: player.getGUID(),
				}),
			)
		);

		console.log('Removed player %s from map %s (guid %d)', player.getName(), this.map.getName(), this.getGUID());
		return this;
	}

	getUnitsAroundMe(unit: Unit, rangeInPixels: number): Unit[] {
		return [...this.getUnitsArray(), ...this.getPlayersArray()].filter(
			(u) => u.getPosition().distance(unit.getPosition()) < rangeInPixels,
		);
	}
}
