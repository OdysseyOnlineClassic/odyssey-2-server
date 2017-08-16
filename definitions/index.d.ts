declare namespace Odyssey {
  export interface Client {
    account: any,
    character: any,
    index: number,
    playing: boolean,
    scriptContext?: any, //TODO can we define this as a context object
    sendMessage(id: number, data: Buffer);
    getAddress();
  }

  export interface ClientManager {
    readonly clients: Array<Client>;
    createClient(socket);
    sendMessageAll(id: number, data: Buffer, ignoreIndex?: number);
    sendMessageMap(id: number, data: Buffer, mapIndex: number, ignoreIndex?: number);
    getClientsByMap(mapIndex: number);
  }

  export interface Data {
    readonly managers: any;
    readonly dataFolder: string;
  }

  export interface GameState {
    readonly data: Data;
    readonly clients: ClientManager;
    readonly managers: any;
    readonly scripts: any;
    processMessage(msg: Message);
    options: GameOptions;
  }

  export interface GameOptions {
    max: {
      attributes: number,
      classes: number,
      floatText: number,
      guilds: number,
      halls: number,
      inventoryObjects: number,
      magic: number,
      mapMonsters: number,
      mapObjects: number,
      maps: number,
      modifications: number, //prefix and suffix ?
      monsters: number,
      npcs: number,
      objects: number,
      players: number,
      projectiles: number,
      requestLength: number,
      skill: number,
      sprite: number,
      users: number
    },
    stats: {
      strength: number,
      endurance: number,
      intelligence: number,
      concentration: number,
      constitution: number,
      stamina: number,
      wisdom: number,
    },
    moneyObject: number,
    costs: {
      durability: number,
      strength: number,
      modifier: number
    },
    guilds: {
      createLevel: number,
      createdPrice: number
      joinLevel: number,
      joinPrice: number,
    },
    timers?: {
      mapSwitch: number,
      movement: number
    }
  }

  export interface Location {
    map: number,
    x: number,
    y: number,
    direction?: number
  }

  export interface Message {

  }
}

declare namespace Express {
  export interface Request {
    gameState: Odyssey.GameState;
  }
}
