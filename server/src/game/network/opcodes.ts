import { server as ServerMsg } from "../../../proto";

export const DisconnectReason = ServerMsg.DisconnectReason;

export enum ServerMessages {
  UNIT = 0,
  UNITLIST,

  DISCONNECT,
  UNIT_DESPAWN,
  MAP,

  GAMEOBJECT_LIST
}

interface coder<T = any> {
  name: string,
  encode(message: T): protobuf.Writer,
  verify(message: { [k: string]: any }): string | null
  create(message: { [k: string]: any }): T
}

const opcodeForEncoder = new Map<string, ServerMessages>()

opcodeForEncoder.set(ServerMsg.Unit.name, ServerMessages.UNIT)
opcodeForEncoder.set(ServerMsg.UnitList.name, ServerMessages.UNITLIST)
opcodeForEncoder.set(ServerMsg.Disconnect.name, ServerMessages.DISCONNECT)
opcodeForEncoder.set(ServerMsg.UnitDespawn.name, ServerMessages.UNIT_DESPAWN)

opcodeForEncoder.set(ServerMsg.Map.name, ServerMessages.MAP)
opcodeForEncoder.set(ServerMsg.GameObjectList.name, ServerMessages.GAMEOBJECT_LIST)

export const encodeMessage = <T>(coder: coder<T>, payload: Record<string, any>) => {
  const op = opcodeForEncoder.get(coder.name)
  if (op === undefined) {
    throw new Error(`No opcode set for message ${coder.name}`)
  }

  const verification = coder.verify(payload)
  if (verification) {
    throw new Error(`Could not very message to server:  ${verification}`)
  }

  const msg = coder.create(payload)
  const data = coder.encode(msg).finish();

  // attach opcode
  return Buffer.concat([Buffer.from([op]), data]);
};

