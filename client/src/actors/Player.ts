import { sendMessage } from "../network";
import Unit from "./Unit";
import { client as ClientMsg } from "../../proto";

interface KeyboardKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class Player extends Unit {
  private keybordKeys: KeyboardKeys;
  constructor(guid: number, name: string, scene: Phaser.Scene) {
    super(guid, name, scene, "player_gfx");
  }

  addedToScene(): void {
    console.log("Added player to scene");
    this.keybordKeys = this.scene.input.keyboard.addKeys(
      "W, A, S, D"
    ) as KeyboardKeys;
  }

  preUpdate(time: number, delta: number): void {
    if (!this.keybordKeys) {
      return;
    }
    let x = 0;
    let y = 0;

    if (this.keybordKeys.W.isDown) {
      y -= this.maxSpeed;
    }

    if (this.keybordKeys.S.isDown) {
      y += this.maxSpeed;
    }

    if (this.keybordKeys.D.isDown) {
      x += this.maxSpeed;
    }

    if (this.keybordKeys.A.isDown) {
      x -= this.maxSpeed;
    }

    this.setVelocityX(x);
    this.setVelocityY(y);

    if (x != 0 || y != 0) {
      sendMessage(
        ClientMsg.Move,
        {
          x: this.x,
          y: this.y,
        });
    }
  }
}
