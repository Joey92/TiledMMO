import { OpcodeHandler } from "../../types";
import { client } from "../../../proto";
import { sWorld } from '../entities/World';

export const handlePlayerMove: OpcodeHandler<client.IMove> = (msg, s) => {
	const p = s.getPlayer();

	if (!p) {
		console.log("No player associated");
		return;
	}

	p.setPosition(msg.x!, msg.y!);
};

export const handlePlayerHeartbeat: OpcodeHandler<client.IHeartBeat> = (msg) => {
	console.log(msg);
};

export const handlePlayerStop: OpcodeHandler<client.IStop> = (msg) => {
	console.log(msg);
};

export const handlePlayerJoin: OpcodeHandler<client.IJoin> = (msg, s) => {
	if (msg.id === undefined) {
		console.log("Join request invalid, no character id provided");
		return;
	}

	sWorld.addPlayer(s, msg.id!);
};
