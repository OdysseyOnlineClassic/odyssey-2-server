declare namespace Script {
  enum MapType {
    friendly,
    normal,
    pk,
    arena
  }

  export interface Map {
    bootLocation: Odyssey.Location,
    name: string,
    type: MapType,

    message(message: string, color: any, ignore?: number): void; //TODO color enum?
    npcSay(message: string);
    npcTell(message: string, player: number);
    openDoor(x: number, y: number);

    despawnMonster(monster: number);
    spawnMonster(monster: number, x: number, y: number);

  }

  export interface Player {
    access: any,
    location: Odyssey.Location;
  }
}
