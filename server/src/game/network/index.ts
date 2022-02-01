import { WebSocketServer } from "ws";
import { client } from "../../../proto";
import { sWorld } from "../entities/World";
import Session from "../entities/Session";
import { ClientOpcodes } from "../../types";
import opcodeHandler from "../handlers";

const coders: Record<number, any> = {
  [ClientOpcodes.JOIN]: client.Join,
  [ClientOpcodes.MOVE]: client.Move,
  [ClientOpcodes.HEARTBEAT]: client.HeartBeat,
  [ClientOpcodes.STOP]: client.Stop,
  [ClientOpcodes.INTERACT]: client.Interact,
};

const wss = new WebSocketServer({ port: 8081 });
console.log("Websocket server running on 8081");

wss.on("connection", (ws) => {
  console.log("client connected");

  const session = new Session(ws);
  sWorld.addSession(session);

  ws.on("message", (msg) => {
    const buf = Buffer.from(msg as ArrayBuffer);
    const [opcode, ...payload] = Array.from(buf.values());

    if (!(opcode in coders)) {
      console.log("Unknown opcode %d", opcode);
      return;
    }

    const coder = coders[opcode];
    if (!(opcode in opcodeHandler)) {
      console.log("No handler for opcode %d", opcode);
      return;
    }

    const decodedPayload = coder.decode(payload);
    opcodeHandler[opcode](decodedPayload, session);
  });

  ws.once("close", () => {
    console.log("client disconnected");
    sWorld.removeSession(session);
  });
});
