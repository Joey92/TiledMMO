import Unit from './Unit';

export default class ThreadManager {
	private readonly owner: Unit;

	constructor(unit: Unit) {
		this.owner = unit;
	}

	update(diff: number) {}
}
