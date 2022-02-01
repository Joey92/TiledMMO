import MapManager from "./MapManager";
import Player from "./Player";
import Session from "./Session";
import "../network/index";

type DummyState = Record<
  number,
  { x: number; y: number; instanceId?: number; name: string, mapName: string }
>;
const dummyPlayerState: DummyState = {
  0: {
    x: 300,
    y: 500,
    mapName: 'city',
    name: "Player 1",
  },
};

export class World {
  private static world: World;

  private sessions = new Map<number, Session>();
  private players = new Map<number, Player>();
  private numPlayers: number = 0;

  private readonly mapManager: MapManager = new MapManager();

  public static getWorld() {
    if (!World.world) {
      World.world = new World();
    }
    return World.world;
  }

  update(diff: number) {
    this.mapManager.update(diff);
  }

  shutdown() {
    this.sessions.forEach((s) => s.disconnect());
  }

  addSession(s: Session) {
    this.sessions.set(s.getGUID(), s);
    this.numPlayers++;
  }

  addPlayer(session: Session, id: number) {
    if (!(id in dummyPlayerState)) {
      console.log("No player state found for id %d", id);
      return;
    }

    const state = dummyPlayerState[id];
    const player = new Player(session, {
      name: state.name,
    });
    // load last player state
    // TODO replace with something more sophisticated

    player.setPosition(state.x, state.y);

    // Load previous instance if it exists
    if (state.instanceId) {
      const instance = this.mapManager.getMapInstanceByID(state.instanceId);

      if (!instance) {
        console.log("Map not found for player");
        return;
      }

      console.log("Add player %s back into instance %d on map %s", player.getName(), instance.getGUID(), instance.getMap().getName());
      instance.addPlayerToMap(player);
      return
    }

    this.mapManager.movePlayerToMap(player, state.mapName)
    return this;
  }

  removeSession(s: Session) {
    const player = s.getPlayer();

    if (!player) {
      // not spawned
      this.sessions.delete(s.getGUID());
      this.numPlayers--;
      return;
    }

    const map = player.getMapInstance();
    if (map) {
      console.log("Remove player %s from map", player.getName());
      map.removePlayerFromMap(player);
    }

    this.sessions.delete(s.getGUID());
    this.numPlayers--;
  }

  getPlayerAmount() {
    return this.numPlayers;
  }

  getMapManager() {
    return this.mapManager
  }
}

export const sWorld = World.getWorld();

export default World;
