import { Message } from '../message';

export interface ProcessFunction {
  (msg: Message): void;
}

export abstract class MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  constructor(protected game: Odyssey.GameState) {
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }
}
