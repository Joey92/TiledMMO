import { OpcodeHandlers, ServerOpcodes } from "../types";
import { handleMap } from "./Map";
import { handleUnit, handleUnitDespawn, handleUnits } from "./Unit";


const opcodeHandler: OpcodeHandlers = {
	[ServerOpcodes.SERVER_MSG_UNITLIST]: handleUnits,
	[ServerOpcodes.SERVER_MSG_UNIT]: handleUnit,
	[ServerOpcodes.SERVER_MSG_UNIT_DESPAWN]: handleUnitDespawn,

	[ServerOpcodes.SERVER_MSG_MAP]: handleMap,
};

export default opcodeHandler