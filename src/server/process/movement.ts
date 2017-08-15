import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';
import { PlayerManager } from '../managers/player';

export class MovementProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  protected playerEvents: PlayerManager;

  constructor(game: Odyssey.GameState) {
    super(game);

    this.processors[7] = this.move.bind(this);
    this.processors[13] = this.switchMap.bind(this);

    this.playerEvents = game.managers.player;
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  move(msg: Message): void {
    let location: Odyssey.Location = {
      map: msg.client.character.map,
      x: msg.data.readUInt8(0),
      y: msg.data.readUInt8(1),
      direction: msg.data.readUInt8(2)
    };

    let walkStep = msg.data.readUInt8(3);

    this.playerEvents.move(msg.client, location, walkStep);
  }

  switchMap(msg: Message): void {
    let exit = msg.data.readUInt8(0);
    this.playerEvents.exitMap(msg.client, exit);
  }
}
