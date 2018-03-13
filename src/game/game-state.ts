import { ClientManager } from '../server/client-manager';
import { Message } from '@odyssey/shared';
import { Enums } from '@odyssey/shared';
import { ScriptManager } from '../script/script';
import { Client } from '../server/client';
import { Accounts } from './systems/accounts/accounts';

export class GameState {
  protected accounts: Accounts = new Accounts(this);

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
  readonly scripts = new ScriptManager(this);

  public options: Server.GameOptions = {
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

  constructor(readonly config: Server.Config) {
    this.clients = new ClientManager(this);

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

  processMessage(msg: Message, client: Client) {
    console.log(`Message ${msg.id} [${msg.data.length}] - ` + (client.account ? client.account.username : client.address));
    console.log(`Playing: ${client.playing}`);

    switch (msg.system) {
      case Enums.Systems.Account:
        this.accounts.process(msg, client);
        break;
      default:
        console.error(`Unknown Message System [${msg.system}]`);
        break;
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
}
