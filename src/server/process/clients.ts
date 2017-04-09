import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';

export class ClientProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[23] = this.joinGame.bind(this);
    this.processors[61] = this.clientInfo.bind(this);
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  clientInfo(msg: Message) {

  }

  joinGame(msg: Message) {
    this.game.clients.sendMessageAll(6, Buffer.from([]), msg.client.index);
  }
}
