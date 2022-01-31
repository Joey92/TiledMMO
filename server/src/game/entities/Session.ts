import { WebSocket } from 'ws';
import { server } from '../../../proto';
import { sWorld as world } from './World';
import Player from './Player';

export default class Session {
	private static GUIDs: number;

	private readonly guid: number;
	private readonly conn: WebSocket;

	private player?: Player;

	constructor(conn: WebSocket) {
		this.conn = conn;
		this.guid = Session.newGUID();
	}

	private static newGUID() {
		return Session.GUIDs++;
	}

	disconnect(reason: server.DisconnectReason | null = null) {
		const disconnectMsg = server.Disconnect.create({
			reason,
		});
		this.conn.send(server.Disconnect.encode(disconnectMsg).finish());
		this.conn.close();
	}

	joinGame(id: number) {
		world.addPlayer(this, id);
		return this;
	}

	send(data: Buffer | Uint8Array) {
		this.conn.send(data);
		return this;
	}

	getGUID() {
		return this.guid;
	}

	setPlayer(p: Player) {
		this.player = p;
		return this;
	}

	getPlayer() {
		return this.player;
	}
}
