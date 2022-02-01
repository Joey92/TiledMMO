import { server as ServerMsg } from "../../proto";
import GameObject from "../actors/GameObject";
import { OpcodeHandler } from "../types";

export const handleGameObjectList: OpcodeHandler<ServerMsg.IGameObjectList> = (
	msg,
	game
) => {
	const scene = game.getGameScene()

	msg.objects.map(({ guid, name, imageName, x, y, width, height, flags }) => {
		console.log(flags)
		const obj = new GameObject(guid, name, scene, imageName)
		obj.setX(x)
		obj.setY(y)
		obj.width = width
		obj.height = height
		obj.setFlags(flags)
		return obj
	}).forEach(scene.addGameObjectToMap, scene)
};

export const handleDespawn: OpcodeHandler<ServerMsg.IDespawn> = (
	msg,
	game
) => {
	game.getGameScene().getObject(msg.guid)?.destroy();
};