import networkHandler, { sendMessage } from "./network";
import { client as ClientMsg } from "../proto";
import GameScene from "./scene/GameScene";
import MenuScene from "./scene/MenuScene";
import LoadingScene from "./scene/LoadingScene";
import UIScene from "./scene/UIScene";

export default class Game extends Phaser.Game {
	private readonly network: { ws: WebSocket; close: () => void };
	private readonly gameScene = new GameScene('game')
	private readonly uiScene = new UIScene('ui')
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

		this.scene.add("loading", new LoadingScene('loading'), false);
		this.scene.add("menu", new MenuScene('menu'), false);
		this.scene.add("game", this.gameScene, false);
		this.scene.add("ui", this.uiScene, false);

		this.network = networkHandler(this, () => {
			sendMessage(ClientMsg.Join, { id: 0 });
		})
	}

	getGameScene() {
		return this.gameScene
	}

	getUiScene() {
		return this.uiScene
	}

	loadNewMap(opts: { name: string, x: number, y: number }) {
		this.scene.stop('ui')
		this.scene.stop('game')
		this.scene.start('loading', opts)
	}

	handleDisconnect() {
		this.scene.start('menu', { error: 'Lost connection to the server.' })
	}
}
