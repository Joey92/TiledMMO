import Session from "./game/entities/Session";

export type OpcodeHandler<Message> = (msg: Message, sess: Session) => void;

export enum ObjectTypes {
	GAME_OBJECT = 'GameObject',
	UNIT = 'UNIT',
	PLAYER = 'PLAYER',
	NPC = 'NPC'
}
export interface ObjectType {
	objectType: ObjectTypes
}

export interface OpcodeHandlers<T extends {}> {
	[index: number]: OpcodeHandler<T>;
}

export enum ClientOpcodes {
	JOIN = 0,
	MOVE,
	HEARTBEAT,
	STOP,
	INTERACT
}