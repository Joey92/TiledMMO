import Phaser from "phaser";
import GameObject from "./GameObject";

enum UnitState {
  STANDING = 1,
}

enum UnitType {
  UNDEFINED = 1,
  HUMAN,
  UNDEAD,
}

export default class Unit extends GameObject {
  private maxHealth: number;
  private health: number;
  protected maxSpeed: number = 100;
  private unitType: UnitType = UnitType.UNDEFINED;
  private unitState: UnitState = UnitState.STANDING;

  constructor(
    guid,
    name,
    scene: Phaser.Scene,
    gfx: string | Phaser.Textures.Texture
  ) {
    super(guid, name, scene, gfx);
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

  getSpeed() {
    return this.maxSpeed
  }
}
