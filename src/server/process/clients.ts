import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { PlayerEvents } from '../events/player';

export class ClientProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  protected playerEvents: PlayerEvents;

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[23] = this.joinGame.bind(this);
    this.processors[61] = this.clientInfo.bind(this);

    this.playerEvents = game.events.player;
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  clientInfo(msg: Message) {

  }

  async joinGame(msg: Message) {
    await this.playerEvents.joinGame(msg.client);
  }
}
