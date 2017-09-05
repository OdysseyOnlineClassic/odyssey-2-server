declare namespace Odyssey {
  export interface Account extends Server.DataDocument {
    username: string;
    password: string;
    access: number;
    email?: string;
  }

  export interface Character extends Server.DataDocument {
    alive: boolean,
    ammo: number,
    bank: any,
    class: any, //Class interface?
    description?: string,
    equipped: any,
    female: boolean,
    guild: GuildAssociation,
    inventory: any,
    location: Location,
    name: string,
    sprite: number,
    status: number,
    stats: Stats,
    timers?: { //Flood, walk, etc.
      walk: number
    }
  }

  export interface GuildAssociation {
    id: number, //Guild numeric id, old system used byte (255)
    rank: number,
    slot: number, //TODO what is this for in old code?
    invite: number //Current invite to join Guild by number id
  }

  export interface Location {
    map: number,
    x: number,
    y: number,
    direction?: number
  }

  export interface Stats {
    attack: number,
    defense: number,
    magicDefense: number,
    maxHp: number,
    maxEnergy: number,
    maxMana: number,
    level: number,
    experience: number
  }
}

/**
 * Definitions for objects that run the server
 */
declare namespace Server {
  namespace Managers {
    export interface AccountManager {
      createAccount(username: string, password: string): Promise<Odyssey.Account>;
      login(username: string, password: string): Promise<Odyssey.Account>;
    }

    export interface CharacterManager {
      createCharacter(accountId: string, name: string, descript: string, classIndex: number, female: boolean);
      getCharacter(accountId: string): Promise<Odyssey.Character>;
    }

    export interface ClientManager {
      readonly clients: Array<Client>;
      createClient(socket);
      sendMessageAll(id: number, data: Buffer, ignoreIndex?: number);
      sendMessageMap(id: number, data: Buffer, mapIndex: number, ignoreIndex?: number);
      getClientsByMap(mapIndex: number);
    }

    export interface PlayerManager {
      exitMap(client: Server.Client, exit: number);
      joinGame(client: Server.Client);
      joinMap(client: Server.Client);
      move(client: Server.Client, location: Odyssey.Location, walkStep: number);
      partMap(client: Server.Client);
      updateName(client: Server.Client);
      warp(client: Server.Client, location: Odyssey.Location);
    }
  }

  export interface Client {
    account: any,
    character: any,
    index: number,
    playing: boolean,
    scriptContext?: any, //TODO can we define this as a context object
    sendMessage(id: number, data: Buffer);
    getAddress();
  }

  export interface Data {
    readonly managers: any;
    readonly dataFolder: string;
  }

  export interface DataDocument {
    readonly _id: string;
    save(): Promise<void>;
  }

  /**
   * Represents game data that's indexed numerically and versioned to reduce load times
   */
  export interface GameDataDocument extends DataDocument {
    index: number;
    version: number;
  }

  /**
   * Created with the anticipation that these will be adjustable per server.
   * Currently they must be exactly the same as expected by the client,
   *  so simply make it easier to reference these values.
   *
   * @export
   * @interface GameOptions
   */
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

  export interface GameState {
    readonly clients: Managers.ClientManager;
    readonly config: Server.Config;
    readonly data: Data;
    readonly managers: {
      accounts: Managers.AccountManager,
      characters: Managers.CharacterManager,
      player: Managers.PlayerManager
    };
    readonly scripts: any;
    processMessage(msg: Message);
    options: GameOptions;
  }

  export interface Message {
    id: number,
    client: Client,
    data: Buffer,
    length: number,
    timestamp: number,
    append(appendData: Buffer),
    isComplete(): boolean,
    send(),
  }

  export interface ProcessFunction {
    (msg: Server.Message): void;
  }
}

declare namespace Express {
  export interface Request {
    gameState: Server.GameState;
  }
}
