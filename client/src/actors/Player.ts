import Unit from "./Unit";



export default class Player extends Unit {

  constructor(guid: number, name: string, scene: Phaser.Scene) {
    super(guid, name, scene, "player_gfx");
  }

  addedToScene(): void {
    console.log("Added player to scene");
  }
}
