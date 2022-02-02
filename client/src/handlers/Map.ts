import { server as ServerMsg } from "../../proto";
import { OpcodeHandler } from "../types";

export const handleMap: OpcodeHandler<ServerMsg.IMap> = (msg, game) => {
	console.log('Loading map', msg)
	game.scene.stop('game')
	game.loadNewMap({ name: msg.name, x: msg.x, y: msg.y });
};

