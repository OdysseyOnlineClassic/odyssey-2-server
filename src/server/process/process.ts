import { GameStateInterface } from '../game-state';
import { Message } from '../message';

export interface ProcessFunction {
  (msg: Message): void;
}

export abstract class MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  constructor(protected game: GameStateInterface) {
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }
}
