import { ClientManager } from './clients/client-manager';
import { Data } from './data/data';
import { DataInterface } from './data/data';
import { Message } from './message';
import { AccountsProcessor } from './process/accounts';
import { ClientProcessor } from './process/clients';
import { GameDataListProcessor } from './process/game-data-lists';
import { GameDataProcessor } from './process/game-data';
import { GuildProcessor } from './process/guilds';
import { MapProcessor } from './process/game-data/maps';
import { MessageProcessor } from './process/process';
import { MovementProcessor } from './process/movement';
import { NpcDataProcessor } from './process/game-data/npcs';
import { ObjectDataProcessor } from './process/game-data/objects';
import { PingProcessor } from './process/ping';
import { RawProcessor } from './process/raw';
import { PlayerEvents } from './events/player';

export interface GameStateInterface {
  readonly data: DataInterface;
  readonly clients: ClientManager;
  readonly events: any;
  processMessage(msg: Message);
  options: GameOptions;
}

/**
 * IOC Container for different aspects of the Odyssey Server
 *
 * @export
 * @class GameState
 */
export class GameState implements GameStateInterface {
  private playingProcessors: Array<MessageProcessor> = new Array<MessageProcessor>(255); //Processors for when a client is playing
  private connectingProcessors: Array<MessageProcessor> = new Array<MessageProcessor>(255); //Processors before a client is playing
  readonly clients: ClientManager;
  readonly data: DataInterface;
  readonly events: {};

  public options = {
    max: {
      attributes: 22,
      classes: 4,
      floatText: 20,
      guilds: 255,
      halls: 255,
      inventoryObjects: 20,
      magic: 500,
      mapMonsters: 20,
      mapObjects: 79,
      maps: 3000,
      modifications: 255, //prefix,suffix?
      monsters: 1000,
      npcs: 500,
      objects: 1000,
      players: 80,
      projectiles: 20,
      requestLength: 200,
      skill: 10,
      sprite: 643,
      users: 80
    },
    stats: {
      strength: 1,
      endurance: 1,
      intelligence: 1,
      concentration: 1,
      constitution: 1,
      stamina: 1,
      wisdom: 1,
    },
    moneyObject: 1,
    costs: {
      durability: 1,
      strength: 1,
      modifier: 1
    },
    guilds: {
      createLevel: 1,
      createdPrice: 1,
      joinLevel: 1,
      joinPrice: 1,
    }
  }

  constructor() {
    this.data = new Data('data/');
    this.clients = new ClientManager(this);

    this.events = {
      player: new PlayerEvents(this)
    }

    this.connectingProcessors[0] = new AccountsProcessor(this);
    this.connectingProcessors[1] = this.connectingProcessors[0];
    this.connectingProcessors[2] = this.connectingProcessors[0];
    this.connectingProcessors[7] = new GameDataListProcessor(this);

    this.connectingProcessors[23] = new ClientProcessor(this);
    this.connectingProcessors[61] = this.connectingProcessors[23];

    this.connectingProcessors[6] = new GuildProcessor(this);
    this.connectingProcessors[24] = this.connectingProcessors[6];

    //TODO some of these are duplicate for connected vs playing modes
    this.connectingProcessors[19] = new ObjectDataProcessor(this);
    this.connectingProcessors[21] = this.connectingProcessors[19];
    this.connectingProcessors[79] = this.connectingProcessors[19];

    this.connectingProcessors[50] = new NpcDataProcessor(this);
    this.connectingProcessors[51] = this.connectingProcessors[50];
    this.connectingProcessors[80] = this.connectingProcessors[50];

    this.connectingProcessors[81] = this.connectingProcessors[19];
    this.connectingProcessors[82] = this.connectingProcessors[19];
    this.connectingProcessors[83] = this.connectingProcessors[19];
    this.connectingProcessors[84] = this.connectingProcessors[19];
    this.connectingProcessors[85] = this.connectingProcessors[19];

    this.connectingProcessors[170] = new RawProcessor(this);
    this.playingProcessors[170] = this.connectingProcessors[170];

    this.playingProcessors[7] = new MovementProcessor(this);
    this.playingProcessors[13] = this.playingProcessors[7];

    this.playingProcessors[12] = new MapProcessor(this);
    this.playingProcessors[45] = this.playingProcessors[12];

    this.playingProcessors[96] = new PingProcessor(this);
  }

  processMessage(msg: Message) {
    console.log(`Message ${msg.id} [${msg.data.length}] - ` + (msg.client.account ? msg.client.account.username : msg.client.socket.address().address));
    console.log(`Playing: ${msg.client.playing}`);

    let processors: Array<MessageProcessor>;
    if (msg.client.playing) {
      processors = this.playingProcessors;
    } else {
      processors = this.connectingProcessors;
    }

    if (processors[msg.id]) {
      processors[msg.id].process(msg);
    } else {
      console.error(`Unhandled Message ${msg.id} [${msg.data.length}] - ` + (msg.client.account ? msg.client.account.username : msg.client.socket.address().address))
    }
  }
}

interface GameOptions {
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
  }
}
