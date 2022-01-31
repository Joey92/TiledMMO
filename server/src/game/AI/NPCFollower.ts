import NPC from "../entities/NPC";
import NPCAI from "./NPCAI";

export default class NPCFollower extends NPCAI {
  private searchTimer = 2000;

  public static makeAI(npc: NPC) {
    return new NPCFollower(npc);
  }

  update(diff: number): void {
    this.searchTimer -= diff;
    if (this.searchTimer > 0) {
      return;
    }
    this.searchTimer = 2000;

    const units = this.me.findNearestUnits(300).filter((u) => u !== this.me);

    if (units.length === 0) {
      return;
    }

    const first = units[0];

    if (this.me.getPosition().distance(first.getPosition()) < 10) {
      return;
    }

    this.me.moveToUnit(first);
  }
}
