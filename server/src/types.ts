import Session from "./game/entities/Session";

export type OpcodeHandler<Message> = (msg: Message, sess: Session) => void;

export interface OpcodeHandlers<T extends {}> {
	[index: number]: OpcodeHandler<T>;
}

export enum ClientOpcodes {
	JOIN = 0,
	MOVE,
	HEARTBEAT,
	STOP,
}