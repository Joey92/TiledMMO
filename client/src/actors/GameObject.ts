import Phaser from "phaser";
import { client } from "../../proto";
import { sendMessage } from "../network";

export enum GameObjectFlags {
	None = 0,
	Interactable = 1, // enable this if it should have interaction on the client
}

export default class GameObject extends Phaser.Physics.Arcade.Sprite {
	private readonly guid: number | Long;
	private flags: number;

	constructor(guid: number | Long,
		name: string,
		scene: Phaser.Scene,
		gfx: string | Phaser.Textures.Texture) {
		super(scene, 0, 0, gfx);
		this.guid = guid;
		this.name = name;
		this.setDepth(10);
	}

	getGuid() {
		return this.guid;
	}

	setFlags(flags) {
		if (flags & GameObjectFlags.Interactable) {
			this.setInteractive()
			this.on("pointerdown", () => {
				sendMessage(client.Interact, { guid: this.getGuid() })
			})
		} else {
			this.off("pointerdown")
			this.removeInteractive()
		}
		this.flags = flags
	}
}