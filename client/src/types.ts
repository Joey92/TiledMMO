import Game from "./game";


export type OpcodeHandler<Message> = (msg: Message, g: Game) => void;

export interface OpcodeHandlers {
	[index: number]: OpcodeHandler<any>;
}

export enum ServerOpcodes {
	UNIT = 0,
	UNITLIST,

	DISCONNECT,
	DESPAWN,
	MAP,

	GAMEOBJECT_LIST,
}
