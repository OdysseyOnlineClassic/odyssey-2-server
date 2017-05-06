import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';

export class MovementProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[7] = this.move.bind(this);
    this.processors[13] = this.switchMap.bind(this);
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  move(msg: Message): void {
    let character = msg.client.character;
    let walk = character.timers.walk || 0;
    if (msg.timestamp > walk) {

      character.timers.walk = msg.timestamp + 500; //TODO make movement speed configurable

      let dx = character.location.x - msg.data.readUInt8(0);
      let dy = character.location.y - msg.data.readUInt8(1);
      let direction = msg.data.readUInt8(2);

      character.location.direction = direction;

      //Only moving in one direction
      if ((Math.abs(dx) + Math.abs(dy)) == 1 &&
        (
          (dy == -1 && direction == 0) ||
          (dy == 1 && direction == 1) ||
          (dx == -1 && direction == 2) ||
          (dx == 1 && direction == 3)
        )) {
        //TODO check if player was facing that direction
        character.location.x += dx;
        character.location.y += dy;
      } else {

      }
    }
  }

  switchMap(msg: Message): void {

  }
}
