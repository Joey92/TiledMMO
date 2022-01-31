import Phaser from "phaser";

enum UnitState {
  STANDING = 1,
}

enum UnitType {
  UNDEFINED = 1,
  HUMAN,
  UNDEAD,
}

export default class Unit extends Phaser.Physics.Arcade.Sprite {
  private maxHealth: number;
  private health: number;
  protected maxSpeed: number = 100;
  private readonly guid: number;
  private unitType: UnitType = UnitType.UNDEFINED;
  private unitState: UnitState = UnitState.STANDING;

  constructor(
    guid,
    name,
    scene: Phaser.Scene,
    gfx: string | Phaser.Textures.Texture
  ) {
    super(scene, 0, 0, gfx);
    this.name = name;
    this.guid = guid;
    this.setDepth(10);
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  getHealth() {
    return this.health;
  }

  getName() {
    return this.name;
  }

  getGuid() {
    return this.guid;
  }

  getUnitType() {
    return this.unitType;
  }

  setUnitType(type: UnitType) {
    this.unitType = type;
    return this;
  }

  getUnitState() {
    return this.unitState;
  }

  setUnitState(state: UnitState) {
    this.unitState = state;
    return this;
  }
}
