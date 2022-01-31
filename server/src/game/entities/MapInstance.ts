import TileMap from './Map';
import Player from './Player';
import Unit from './Unit';
import Timer from '../utils/timer';
import { encodeMessage } from '../network/opcodes';
import GameObject from './GameObject';
import { server as ServerMsg } from '../../../proto'
import { Server } from 'http';

export default class MapInstance {
	private static GUIDs: number = 0;

	private readonly guid: number;
	protected readonly map: TileMap;
	private units = new Map<number, Unit>();
	private objects = new Map<number, GameObject>();
	private players = new Map<number, Player>();

	// send unit updates only every 100 ms
	private unitUpdatesTimer = new Timer(100);

	constructor(map: TileMap) {
		this.map = map;

		this.guid = MapInstance.newGUID();

		map.extractNPCs().forEach(this.addUnit, this)

		this.units.forEach((u) =>
			console.log(
				'npc %d has been added to the map %s',
				u.getGUID(),
				map.getId(),
			)
		);

		this.map.extractObjects().forEach(this.addGameObject, this)
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

	private getPlayers() {
		return Array.from(this.players.values());
	}

	private getUnits() {
		return Array.from(this.units.values());
	}

	sendGameObjectUpdates() {
		const gameobjects = this.getUnits()
			.map((unit) => unit.createUpdate())
			.filter((u) => u);

		if (gameobjects.length == 0) {
			return
		}

		this.getPlayers().forEach((p) =>
			p.sendDirectMessage(
				encodeMessage(ServerMsg.GameObjectList, {
					objects: gameobjects,
				}),
			)
		);
	}

	sendUnitUpdates() {
		const unitStates = this.getUnits()
			.map((unit) => unit.createUnitUpdate())
			.filter((u) => u);

		if (unitStates.length == 0) {
			return
		}

		this.getPlayers().forEach((p) =>
			p.sendDirectMessage(
				encodeMessage(ServerMsg.UnitList, {
					units: unitStates,
				}),
			)
		);
	}

	sendPlayerUpdates() {
		const unitStates = this.getPlayers()
			.map((p) => p.createUnitUpdate())
			.filter((u) => u);

		if (unitStates.length == 0) {
			return
		}

		this.getPlayers().forEach((p) =>
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

		const unitStates = [...this.getUnits(), ...this.getPlayers()]
			.map((unit) => unit.createUnitUpdate(true))
			.filter((u) => u);

		if (unitStates.length != 0) {
			player.sendDirectMessage(
				encodeMessage(ServerMsg.UnitList, {
					units: unitStates,
				}),
			);
		}

		player.setInWorld(true); // set in world so updates will be created
		// send the other players a full update of us
		const pUpdate = player.createUnitUpdate(true);
		if (pUpdate) {
			this.getPlayers().forEach((otherPlayer) =>
				otherPlayer.sendDirectMessage(
					encodeMessage(ServerMsg.Unit, pUpdate),
				)
			);
		}

		this.players.set(player.getGUID(), player);
	}

	removePlayerFromMap(player: Player) {
		player.setInWorld(false);
		this.getPlayers().forEach((otherPlayer) =>
			otherPlayer.sendDirectMessage(
				encodeMessage(ServerMsg.UnitDespawn, {
					guid: player.getGUID(),
				}),
			)
		);

		this.players.delete(player.getGUID());
		player.setMap(undefined)
		return this;
	}

	getUnitsAroundMe(unit: Unit, rangeInPixels: number): Unit[] {
		return [...this.getUnits(), ...this.getPlayers()].filter(
			(u) => u.getPosition().distance(unit.getPosition()) < rangeInPixels,
		);
	}
}
