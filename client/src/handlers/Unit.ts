import { server as ServerMsg } from "../../proto";
import GameScene from "../scene/GameScene";
import NPC from "../actors/NPC";
import { OpcodeHandler } from "../types";
import Unit from "../actors/Unit";

export const handleUnits: OpcodeHandler<ServerMsg.IUnitList> = (msg, game) => {
	msg.units.forEach((u) => updateUnit(u, game.getGameScene()));
};

export const handleUnit: OpcodeHandler<ServerMsg.IUnit> = (msg, game) => {
	updateUnit(msg, game.getGameScene());
};

export const updateUnit = (unit: ServerMsg.IUnit, scene: GameScene) => {
	const u = scene.getObject(unit.object.guid) as Unit;
	if (u) {
		u.setX(unit.object.x);
		u.setY(unit.object.y);


		if (unit.type) {
			u.setUnitType(unit.type);
		}

		if (unit.object.imageName) {
			u.setTexture(unit.object.imageName);
		}
		return;
	}

	const npc = new NPC(unit.object.guid, unit.object.name, scene, unit.object.imageName);
	npc.setPosition(unit.object.x, unit.object.y);
	scene.addGameObjectToMap(npc);
};