import {Data} from './data/data';
import {Message} from './message';

export interface GameStateInterface {
  readonly data: Data;
  processMessage(msg: Message)
}
