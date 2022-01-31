import NPC from "../entities/NPC";
import NPCFollower from "./NPCFollower";
import UnitScript from "./NPCAI";

interface Script {
  makeAI(npc: NPC): UnitScript;
}

const scripts: Record<string, Script> = {
  NPCFollower: NPCFollower,
};

const applyScript = (name: string, npc: NPC) => {
  if (name in scripts) {
    const ai = scripts[name].makeAI(npc);
    npc.setAI(ai);
    return ai;
  }
};

export default applyScript;
