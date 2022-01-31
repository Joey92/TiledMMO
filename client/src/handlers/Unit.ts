import { server as ServerMsg } from "../../proto";
import GameScene from "../scene/GameScene";
import NPC from "../actors/NPC";
import { OpcodeHandler } from "../types";

export const handleUnits: OpcodeHandler<ServerMsg.IUnitList> = (msg, game) => {
	msg.units.forEach((u) => updateUnit(u, game.getGameScene()));
};

export const handleUnit: OpcodeHandler<ServerMsg.IUnit> = (msg, game) => {
	updateUnit(msg, game.getGameScene());
};

export const handleUnitDespawn: OpcodeHandler<ServerMsg.IUnitDespawn> = (
	msg,
	game
) => {
	game.getGameScene().getUnit(msg.guid).destroy();
};

export const updateUnit = (unit: ServerMsg.IUnit, scene: GameScene) => {
	const u = scene.getUnit(unit.object.guid as number);
	if (u) {
		u.setX(unit.object.x);
		u.setY(unit.object.y);


		if (unit.type) {
			u.setUnitType(unit.type);
		}

		if (unit.object.imageName) {
			u.setTexture(unit.object.imageName);
		}

		console.log("Updated unit %d, x: %d, y: %d", unit.object.guid, unit.object.x, unit.object.y);
		return;
	}

	console.log("New unit", unit);
	const npc = new NPC(unit.object.guid, unit.object.name, scene, unit.object.imageName);
	npc.setPosition(unit.object.x, unit.object.y);
	scene.addUnitToMap(npc);
};