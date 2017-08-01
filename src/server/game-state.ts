import { ClientManager } from './clients/client-manager';
import { Data } from './data/data';
import { Message } from './message';
import { AccountsProcessor } from './process/accounts';
import { ClientProcessor } from './process/clients';
import { DebugProcessor } from './process/debug';
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
import { AccountManager } from './managers/accounts';
import { CharacterManager } from './managers/characters';
import { PlayerManager } from './managers/player';

/**
 * IOC Container for different aspects of the Odyssey Server
 *
 * @export
 * @class GameState
 */
export class GameState implements Odyssey.GameState {
  private playingProcessors: Array<MessageProcessor> = new Array<MessageProcessor>(255); //Processors for when a client is playing
  private connectingProcessors: Array<MessageProcessor> = new Array<MessageProcessor>(255); //Processors before a client is playing
  private intervalId: number;
  private updateInProgress: boolean = false;
  private performance: {
    updateAverage: number,
    latestUpdate: number,
    diff: [number, number]
  }
  private firstTick: [number, number];
  private timestamp: [number, number];
  private counter: number = 0;

  readonly clients: ClientManager;
  readonly data: Odyssey.Data;
  readonly managers: {};

  public options: Odyssey.GameOptions = {
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

  constructor(private readonly config: Odyssey.Config) {
    this.data = new Data('data/');
    this.clients = new ClientManager(this);

    this.managers = {
      accounts: new AccountManager(this),
      characters: new CharacterManager(this),
      player: new PlayerManager(this)
    }

    this.setListeners();

    let interval = config.server.interval || 100;
    this.start(interval);

    this.firstTick = process.hrtime();
  }

  /**
   * Get current timer in ms
   */
  get tick(): number {
    let tick = process.hrtime(this.firstTick);
    return (tick[0] * 1e9 + tick[1]) / 1000000
  }

  processMessage(msg: Message) {
    console.log(`Message ${msg.id} [${msg.data.length}] - ` + (msg.client.account ? msg.client.account.username : msg.client.getAddress().address));
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
      console.error(`Unhandled Message ${msg.id} [${msg.data.length}] - ` + (msg.client.account ? msg.client.account.username : msg.client.getAddress().address))
    }
  }

  start(interval: number = 10) {
    this.performance = {
      updateAverage: 0.0,
      latestUpdate: 0.0,
      diff: [0, 0]
    };

    this.intervalId = setInterval(this.update.bind(this), interval);
  }

  stop() {
    clearInterval(this.intervalId);
  }

  protected update() {
    if (this.updateInProgress) {
      return;
    }
    this.updateInProgress = true;
    this.timestamp = process.hrtime();

    this.performance.diff = process.hrtime(this.timestamp)
    this.performance.updateAverage -= this.performance.updateAverage / 100;
    this.performance.latestUpdate = (this.performance.diff[0] * 1e9 + this.performance.diff[1])
    this.performance.updateAverage += this.performance.latestUpdate / 1000000 / 100;
    this.updateInProgress = false;
  }

  private setListeners() {
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

    this.playingProcessors[100] = new DebugProcessor(this);
  }
}
