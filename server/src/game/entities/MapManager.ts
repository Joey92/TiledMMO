import map from './Map';

import MapInstance from './MapInstance';

import fs from 'fs';
import Player from './Player';
import { GUID } from './GameObject';
import { DateTime } from 'luxon'
import Timer from '../utils/timer';

export default class MapManager {
	private readonly maps: Map<string, map>;
	private mapInstances = new Map<number, MapInstance>();
	private globalMaps = new Map<string, MapInstance>();
	private playerInstances = new Map<GUID, MapInstance>();

	// clean up maps every hour
	private mapCleanTimer: Timer = new Timer(60 * 60 * 1000);

	constructor() {
		const maps = fs.readdirSync('./maps').map(file => {
			if (!file.endsWith('.json')) {
				return
			}

			const name = file.replace('.json', '')

			const mapFileContent = JSON.parse(fs.readFileSync(`./maps/${file}`).toString())
			return new map(name, mapFileContent);
		}).filter(m => m) as map[];
		this.maps = new Map<string, map>(maps.map(m => [m.getName(), m]))

		this.maps.forEach(m => console.log('Loaded map %s', m.getName()));
	}

	update(diff: number) {
		this.mapInstances.forEach((instance) => instance.update(diff));
		this.globalMaps.forEach((instance) => instance.update(diff));

		this.mapCleanTimer.update(diff)
		if (this.mapCleanTimer.passed()) {
			console.log('Cleaning player maps')
			this.cleanPlayerInstances()
			this.mapCleanTimer.reset()
		}
	}

	getMapInstanceByID(id: number) {
		return this.mapInstances.get(id);
	}

	// Moves player to a new map
	// if instanced it will create a new instance just for the player
	movePlayerToMap(player: Player, mapName: string, instanced: boolean = false) {

		if (!this.maps.has(mapName)) {
			console.error('No map was found under the name %s', mapName)
			return
		}

		const map = this.maps.get(mapName)!

		if (!instanced) {
			const gMap = this.globalMaps.get(mapName)
			if (gMap) {
				const currentMap = player.getMapInstance()
				if (currentMap) {
					currentMap.removePlayerFromMap(player)
				}
				gMap.addPlayerToMap(player)
				return
			}


			const instance = new MapInstance(map)

			this.globalMaps.set(instance.getMap().getName(), instance)
			const currentMap = player.getMapInstance()
			if (currentMap) {
				currentMap.removePlayerFromMap(player)
			}
			console.error('Add player to global map %s', mapName)
			instance.addPlayerToMap(player)
			return
		}

		const instance = new MapInstance(map, 0, DateTime.now().plus({ hours: 2 }))

		this.mapInstances.set(instance.getGUID(), instance)
		this.playerInstances.set(player.getGUID(), instance)

		const currentMap = player.getMapInstance()
		if (currentMap) {
			currentMap.removePlayerFromMap(player)
		}
		console.error('Add player to instanced map %s', mapName)
		instance.addPlayerToMap(player)
	}

	cleanPlayerInstances() {
		const now = DateTime.now()

		const instancesToDelete = Array.from(this.playerInstances.entries())

		instancesToDelete.filter(([_, instance]) => {
			if (!instance.expiresAt) {
				return false
			}

			if (instance.expiresAt > now) {
				return false
			}

			if (instance.getPlayersArray().length > 0) {
				// don't delete if someone is still on the map
				return false
			}

			return true
		})
			.forEach(([guid, instance]) => {
				this.playerInstances.delete(guid)
				this.mapInstances.delete(instance.getGUID())
			})
	}
}
