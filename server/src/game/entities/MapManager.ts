import map from './Map';

import MapInstance from './MapInstance';

import fs from 'fs';
export default class MapManager {
	private readonly maps: map[];
	private mapInstances = new Map<number, MapInstance>();

	constructor() {
		this.maps = fs.readdirSync('./maps').map(file => {
			if (!file.endsWith('.json')) {
				return
			}

			const name = file.replace('.json', '')

			const mapFileContent = JSON.parse(fs.readFileSync(`./maps/${file}`).toString())
			return new map(name, mapFileContent);
		}).filter(m => m) as map[];
		this.maps.forEach(m => console.log('Loaded map %s', m.getName()));

		this.maps
			.map((m) => new MapInstance(m))
			.forEach((m) => this.mapInstances.set(m.getGUID(), m));

		this.mapInstances.forEach((m) => console.log('Loaded instance of map %s guid %d', m.getMap().getName(), m.getGUID()))

	}

	update(diff: number) {
		this.mapInstances.forEach((instance) => instance.update(diff));
	}

	getMapInstanceByID(id: number) {
		return this.mapInstances.get(id);
	}
}
