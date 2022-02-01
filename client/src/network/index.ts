import { server as ServerMsg } from "../../proto";
import Buffer from "Buffer/";
import Game from "../game";
import opcodeHandler from "../handlers";
import { client as ClientMsg } from "../../proto";
import { ServerOpcodes } from "../types";

let ws: WebSocket;

const coders = {
  [ServerOpcodes.UNIT]: ServerMsg.Unit,
  [ServerOpcodes.UNITLIST]: ServerMsg.UnitList,

  [ServerOpcodes.DISCONNECT]: ServerMsg.Disconnect,
  [ServerOpcodes.DESPAWN]: ServerMsg.Despawn,

  [ServerOpcodes.MAP]: ServerMsg.Map,
  [ServerOpcodes.GAMEOBJECT_LIST]: ServerMsg.GameObjectList,

};

const networkHandler = (game: Game, onOpen?: () => void) => {

  ws = new WebSocket("ws://localhost:8081");

  ws.onopen = onOpen ? onOpen : () => undefined

  ws.onmessage = (msg) => {
    msg.data
      .stream()
      .getReader()
      .read()
      .then(({ value }) => {
        const [opcode, ...payload] = value;

        if (!(opcode in coders)) {
          console.log("Opcode %d does not exist in coders", opcode);
          return;
        }

        const coder = coders[opcode];

        const msg = coder.decode(payload);
        if (opcode in opcodeHandler) {
          console.log("Handle Opcode %d", opcode);
          opcodeHandler[opcode](msg, game);
        }
      });
  };

  const disconnectHandler = () => {
    game.handleDisconnect();
  }

  ws.onerror = disconnectHandler
  ws.onclose = disconnectHandler

  return {
    ws,
    close: () => {
      ws.close()
      game.handleDisconnect();
    },
  };
};

export enum Opcodes {
  JOIN = 0,
  MOVE,
  HEARTBEAT,
  STOP,
  INTERACT
}

interface coder<T = any> {
  name: string,
  encode(message: T): protobuf.Writer,
  verify(message: { [k: string]: any }): string | null
  create(message: { [k: string]: any }): T
}

const opcodeForEncoder = new Map<string, Opcodes>()

opcodeForEncoder.set(ClientMsg.Join.name, Opcodes.JOIN)
opcodeForEncoder.set(ClientMsg.Move.name, Opcodes.MOVE)
opcodeForEncoder.set(ClientMsg.HeartBeat.name, Opcodes.HEARTBEAT)
opcodeForEncoder.set(ClientMsg.Stop.name, Opcodes.STOP)
opcodeForEncoder.set(ClientMsg.Interact.name, Opcodes.INTERACT)

export const sendMessage = <T>(coder: coder<T>, payload: Record<string, any>) => {
  if (ws.readyState !== 1) {
    return;
  }

  const op = opcodeForEncoder.get(coder.name)
  if (op === undefined) {
    console.error('No opcode set for message', coder.name)
    return
  }

  const verification = coder.verify(payload)
  if (verification) {
    console.error('Could not very message to server: ', verification)
    return
  }

  const msg = coder.create(payload)
  const data = coder.encode(msg).finish();

  // attach opcode
  const message = Buffer.Buffer.concat([Buffer.Buffer.from([op]), data]);

  ws.send(message);
};

export default networkHandler;
