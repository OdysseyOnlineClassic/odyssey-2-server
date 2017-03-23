import { GameStateInterface } from '../game-state-interface';
import { Message } from '../message';

export abstract class MessageProcessor {
  constructor(protected game: GameStateInterface) {
  }

  abstract process(msg: Message): void;
}
