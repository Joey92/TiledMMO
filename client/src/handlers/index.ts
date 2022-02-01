import { OpcodeHandlers, ServerOpcodes } from "../types";
import { handleMap } from "./Map";
import { handleUnit, handleUnits } from "./Unit";
import { handleGameObjectList, handleDespawn } from './GameObject'


const opcodeHandler: OpcodeHandlers = {
	[ServerOpcodes.UNITLIST]: handleUnits,
	[ServerOpcodes.UNIT]: handleUnit,
	[ServerOpcodes.DESPAWN]: handleDespawn,

	[ServerOpcodes.MAP]: handleMap,
	[ServerOpcodes.GAMEOBJECT_LIST]: handleGameObjectList,
};

export default opcodeHandler