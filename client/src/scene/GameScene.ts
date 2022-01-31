import { Math } from "phaser";
import Player from "../actors/Player";
import Unit from "../actors/Unit";

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

function getProperties<T extends {}>(properties: Property[]): T {
  return properties.reduce((acc, prop) => {
    acc[prop.name] = prop.value;
    return acc;
  }, {} as T);
}

interface PortalProps {
  map: string;
  x: number;
  y: number;
}

export default class GameScene extends Phaser.Scene {
  private player: Player;
  private units = new Map<number | Long, Unit>();

  private name: string

  prefixedKey(...vals: string[]) {
    return `tilemap_${this.name}_` + vals.join("_");
  }

  init({ name }) {
    this.name = name
  }

  preload() {
    this.load.baseURL = "/maps/";

    this.load.tilemapTiledJSON(this.prefixedKey("map"), `${this.name}.json`);

    this.load.spritesheet("player_gfx", "images/TX Player.png", {
      frameWidth: 32,
      frameHeight: 64,
      endFrame: 3,
    });
  }
  create({ x, y }) {
    const tileMapData = this.cache.tilemap.get(this.prefixedKey("map")).data

    tileMapData.tilesets.forEach((ts) => {
      this.load.image(this.prefixedKey(ts.name), ts.image);
    });
    this.load.start()

    this.load.once('complete', () => {
      const tMap = this.make.tilemap({ key: this.prefixedKey("map") });

      const tilesets = tileMapData.tilesets.map((ts) =>
        tMap.addTilesetImage(ts.name, this.prefixedKey(ts.name))
      );

      const tileLayers = tileMapData.layers.filter((l) => l.type === "tilelayer");
      const objectLayers = tileMapData.layers.filter(
        (l) => l.type === "objectgroup"
      );

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

      objectLayers.forEach((l) => {
        l.objects.forEach((obj) => {
          switch (obj.type) {
            case "Portal":
              const { map, x, y } = getProperties<PortalProps>(obj.properties);

              if (!map || x === undefined || y === undefined) {
                console.error(
                  "Portal invalid, make sure it has properties map, x, and y."
                );
                return;
              }

              const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height);

              const geom = obj.ellipse
                ? new Phaser.Geom.Circle(obj.x, obj.y, obj.width)
                : new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);

              zone.setInteractive({
                hitArea: geom,
                useHandCursor: true,
              } as Phaser.Types.Input.InputConfiguration);

              zone.on("pointerdown", () => {
                const dist = Math.Distance.BetweenPoints(zone, this.player);
                if (dist > 50) {
                  console.error("You need to go closer", dist);
                  return;
                }
                this.scene.start(map, { x, y });
              });
              break;
          }
        });
      });
    })

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
  }

  addUnitToMap(unit: Unit) {
    this.units.set(unit.getGuid(), unit);
    this.add.existing(unit);
  }

  getUnit(guid: number | Long) {
    return this.units.get(guid);
  }

  handleDisconnect() {
    this.scene.start("menu", { msg: "disconnected from server" });
  }
}
