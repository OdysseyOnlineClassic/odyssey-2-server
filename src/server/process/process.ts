import { GameStateInterface } from '../game-state';
import { Message } from '../message';

export interface ProcessFunction {
  (msg: Message): void;
}

export abstract class MessageProcessor {
  constructor(protected game: GameStateInterface) {
  }

  abstract process(msg: Message);
}
