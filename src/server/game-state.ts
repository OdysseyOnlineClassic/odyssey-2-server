import { Data } from './data/data';
import { DataInterface } from './data/data';
import { Message } from './message';
import { MessageProcessor } from './process/process';
import { AccountsProcessor } from './process/accounts';
import { GameDataListProcessor } from './process/game-data-lists';
import { RawProcessor } from './process/raw';

export interface GameStateInterface {
  readonly data: DataInterface;
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
  private processors: Array<MessageProcessor> = new Array<MessageProcessor>(255);
  readonly emptyBuffer: Buffer = Buffer.from([]);

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

  constructor(public readonly data: DataInterface) {
    this.processors[0] = new AccountsProcessor(this);
    this.processors[1] = this.processors[0];
    this.processors[2] = this.processors[0];
    this.processors[7] = new GameDataListProcessor(this);
    //this.processors[61] =

    this.processors[170] = new RawProcessor(this);
  }

  processMessage(msg: Message) {
    console.log(`Message ${msg.id}`);
    if (this.processors[msg.id]) {
      this.processors[msg.id].process(msg);
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
