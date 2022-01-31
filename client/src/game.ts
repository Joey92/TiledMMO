import networkHandler, { sendMessage } from "./network";
import { client as ClientMsg } from "../proto";
import GameScene from "./scene/GameScene";
import MenuScene from "./scene/MenuScene";

export default class Game extends Phaser.Game {
	private readonly network: { ws: WebSocket; close: () => void };
	private readonly gameScene = new GameScene('game')
	constructor() {
		super({
			type: Phaser.AUTO,
			width: 800,
			height: 600,
			physics: {
				default: "arcade",
				arcade: {
					debug: true,
				},
			},
			scale: {
				mode: Phaser.Scale.RESIZE,
				autoCenter: Phaser.Scale.CENTER_BOTH,
			},
		});

		this.scene.add("menu", new MenuScene('menu'), true);
		this.scene.add("game", this.gameScene, false);

		this.network = networkHandler(this, () => {
			sendMessage(ClientMsg.Join, { id: 0 });
		})
	}

	getGameScene() {
		return this.gameScene
	}

	loadNewMap(opts: { name: string, x: number, y: number }) {
		this.scene.start('game', opts)
	}

	handleDisconnect() {
		this.scene.start('menu', { error: 'Lost connection to the server.' })
	}
}
