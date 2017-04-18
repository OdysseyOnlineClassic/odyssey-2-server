import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';

export class PingProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[96] = this.ping.bind(this);
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  ping(msg: Message): void {
    msg.client.sendMessage(149, Buffer.from([]));
  }
}
