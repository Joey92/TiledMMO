import { client } from "../../proto";
import GameObject from "../actors/GameObject";
import Player from "../actors/Player";
import Game from "../game";
import { sendMessage } from "../network";

export interface TileMap {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: Layer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: Tileset[];
  tilewidth: number;
  type: string;
  version: string;
  width: number;
}

export interface Layer {
  data?: number[];
  height?: number;
  id?: number;
  name: string;
  opacity: number;
  properties?: Property[];
  type: string;
  visible: boolean;
  width?: number;
  x: number;
  y: number;
  draworder?: string;
  objects?: Object[];
}

export interface Object {
  height: number;
  id: number;
  name: string;
  properties?: Property[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  ellipse?: boolean;
}

export interface Property {
  name: string;
  type: string;
  value: boolean | number | string;
}

export interface Tileset {
  columns: number;
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
  tiles?: Tile[];
}

export interface Tile {
  id: number;
  objectgroup?: Objectgroup;
}

export interface Objectgroup {
  draworder: string;
  id?: number;
  name: string;
  objects: Object[];
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
}

function getProperties<T extends {}>(properties?: Property[]): T {

  if (!properties) {
    return {} as T;
  }
  return properties.reduce((acc, prop) => {
    acc[prop.name] = prop.value;
    return acc;
  }, {} as T);
}


interface KeyboardKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class GameScene extends Phaser.Scene {
  private player: Player;
  private gameObjects = new Map<number | Long, GameObject>();
  private keybordKeys: KeyboardKeys;

  private name: string

  prefixedKey(...vals: string[]) {
    return `tilemap_${this.name}_` + vals.join("_");
  }

  init({ name }) {
    console.log('init game')
    this.name = name
    this.gameObjects = new Map<number | Long, GameObject>();

    this.keybordKeys = this.input.keyboard.addKeys(
      "W, A, S, D"
    ) as KeyboardKeys;

    this.events.on('preupdate', () => {
      if (!this.keybordKeys) {
        return;
      }
      let x = 0;
      let y = 0;

      if (this.keybordKeys.W.isDown) {
        y -= this.player.getSpeed();
      }

      if (this.keybordKeys.S.isDown) {
        y += this.player.getSpeed();
      }

      if (this.keybordKeys.D.isDown) {
        x += this.player.getSpeed();
      }

      if (this.keybordKeys.A.isDown) {
        x -= this.player.getSpeed();
      }

      this.player.setVelocityX(x);
      this.player.setVelocityY(y);

      if (x != 0 || y != 0) {
        sendMessage(
          client.Move,
          {
            x: this.player.x,
            y: this.player.y,
          });
      }
    })
  }

  create({ x, y }) {
    console.log('create game')

    this.player = new Player(0, "Player", this);

    if (x && y) {
      // set player position from scene data
      this.player.setX(x);
      this.player.setY(y);
    }

    this.physics.add.existing(this.player);
    this.add.existing(this.player);
    // this.player.setSize(30, 30)

    this.cameras.main.startFollow(this.player);
    // this.cameras.main.setLerp(.1, .1)
    this.cameras.main.setZoom(2);

    const g = this.game as Game

    const ui = g.getUiScene()

    ui.addGossipText({ talker: this.player, text: "Hello" })
      .addGossipText({ talker: this.player, text: "World" })
      .addGossipText({ talker: this.player, text: "Whats going on?" })
      .advanceGossip();

    const tm = this.cache.tilemap.get(this.prefixedKey("map"))

    console.log(tm);
    const tileMapData = tm.data as TileMap

    console.log(tileMapData)
    const tMap = this.make.tilemap({ key: this.prefixedKey("map") });

    const tilesets = tileMapData.tilesets.map((ts) =>
      tMap.addTilesetImage(ts.name, this.prefixedKey(ts.name))
    );

    const tileLayers = tileMapData.layers.filter((l) => l.type === "tilelayer");

    tileLayers.forEach((l) => {
      const layer = tMap.createLayer(l.name, tilesets);
      const { depth, collision } = getProperties<{
        depth?: number;
        collision?: boolean;
      }>(l.properties);

      if (depth) {
        layer.setDepth(depth);
      }

      if (collision) {
        tMap.setCollisionByProperty(
          {
            collision: true,
          },
          true,
          false,
          layer
        );
        this.physics.add.collider(this.player, layer);
      }
    });


  }

  addGameObjectToMap(go: GameObject) {
    console.log('Add game object to scene', go)
    this.gameObjects.set(go.getGuid(), go)
    this.add.existing(go)
  }

  getObject(guid: number | Long) {
    return this.gameObjects.get(guid);
  }

  handleDisconnect() {
    this.scene.start("menu", { msg: "disconnected from server" });
  }
}
