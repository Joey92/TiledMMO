import Unit from './Unit';

export default class CombatManager {
	private readonly owner: Unit;

	constructor(unit: Unit) {
		this.owner = unit;
	}

	update(diff: number) {}
}
