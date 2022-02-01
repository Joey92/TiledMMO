import { OpcodeHandler } from "../../types";
import { client } from "../../../proto";
import { extractGUIDnumber } from "../entities/GameObject";

export const handleInteract: OpcodeHandler<client.IInteract> = (msg, session) => {

	const player = session.getPlayer()

	if (!player) {
		return
	}

	const instance = player.getMapInstance()

	if (!instance) {
		return
	}

	const obj = instance.getGameObject(extractGUIDnumber(msg.guid!))
	if (obj === undefined) {
		console.log('Object guid %d does not exist on map %s (guid %d)', msg.guid, instance.getMap().getName(), instance.getGUID())
		return
	}

	obj.interactWith(player)
};