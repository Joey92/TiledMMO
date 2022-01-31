import Unit from "../entities/Unit";

export default abstract class NPCAI {
  // ref to self
  protected readonly me: Unit;

  constructor(unit: Unit) {
    this.me = unit;
  }

  abstract update(diff: number): void;

  evade() {
    const loc = this.me.getSpawnPosition();
    this.me.moveTo(loc);
  }
}
