import { Data } from './data/data';
import { DataInterface } from './data/data';
import { Message } from './message';
import { MessageProcessor } from './process/process';
import { AccountsProcessor } from './process/accounts';
import { GameDataProcessor } from './process/game-data';

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
    }
  }

  constructor(public readonly data: DataInterface) {
    this.processors[0] = new AccountsProcessor(this);
    this.processors[1] = this.processors[0];
    this.processors[2] = this.processors[0];
    this.processors[7] = new GameDataProcessor(this);
    //this.processors[61] =
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
  }
}
