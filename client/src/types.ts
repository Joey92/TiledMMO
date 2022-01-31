import Game from "./game";


export type OpcodeHandler<Message> = (msg: Message, g: Game) => void;

export interface OpcodeHandlers {
	[index: number]: OpcodeHandler<any>;
}

export enum ServerOpcodes {
	SERVER_MSG_UNIT = 0,
	SERVER_MSG_UNITLIST,

	SERVER_MSG_DISCONNECT,
	SERVER_MSG_UNIT_DESPAWN,
	SERVER_MSG_MAP,
}
