import * as Data from './data/data';
import {GameStateInterface} from './game-state-interface';
import { Message } from './message';
import { MessageProcessor } from './process/process';
import { AccountsProcessor } from './process/accounts';

/**
 * IOC Container for different aspects of the Odyssey Server
 *
 * @export
 * @class GameState
 */
export class GameState implements GameStateInterface {
  private processors: Array<MessageProcessor> = new Array<MessageProcessor>(255);
  readonly emptyBuffer: Buffer = Buffer.from([]);

  constructor(public readonly data: Data.Data) {
    this.processors[0] = new AccountsProcessor(this);
    this.processors[1] = this.processors[0];
    //this.processors[61] =
  }

  processMessage(msg: Message) {
    if (this.processors[msg.id]) {
      this.processors[msg.id].process(msg);
    }
  }
}
