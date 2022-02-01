import { ClientOpcodes, OpcodeHandlers } from "../../types";
import { handleInteract } from "./gameobject";
import { handlePlayerHeartbeat, handlePlayerJoin, handlePlayerMove, handlePlayerStop } from "./player";

const opcodeHandler: OpcodeHandlers<any> = {
	[ClientOpcodes.JOIN]: handlePlayerJoin,
	[ClientOpcodes.MOVE]: handlePlayerMove,
	[ClientOpcodes.HEARTBEAT]: handlePlayerHeartbeat,
	[ClientOpcodes.STOP]: handlePlayerStop,
	[ClientOpcodes.INTERACT]: handleInteract,
};

export default opcodeHandler