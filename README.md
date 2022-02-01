# TiledMMO

This project is a client and server combo tiled map multiplayer/MMO game engine. You only need your tiled maps, the rest is handled by ther server and client.

Some features include:

- Multiplayer support
- NPCs via object layer
  - properties on the objects configure how the NPC behaves
- NPC navigation via navmesh
- Portals to other maps
- Full scripting support

Upcoming features:

- Combat system
- Quests
- Inventory system
- Dungeons

To include your maps create a symlink/copy to your tiled project here:

- client/src/assets/maps
- server/maps

The client can be hosted on a static webhosting service.
The server does not need any database storage, up to now.
