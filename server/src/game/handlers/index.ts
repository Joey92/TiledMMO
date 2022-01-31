import { ClientOpcodes, OpcodeHandlers } from "../../types";
import { handlePlayerHeartbeat, handlePlayerJoin, handlePlayerMove, handlePlayerStop } from "./player";

const opcodeHandler: OpcodeHandlers<any> = {
	[ClientOpcodes.JOIN]: handlePlayerJoin,
	[ClientOpcodes.MOVE]: handlePlayerMove,
	[ClientOpcodes.HEARTBEAT]: handlePlayerHeartbeat,
	[ClientOpcodes.STOP]: handlePlayerStop,
};

export default opcodeHandler