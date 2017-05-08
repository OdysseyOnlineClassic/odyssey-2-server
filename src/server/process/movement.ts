import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';
import { PlayerEvents } from '../events/player';
import { CharacterDataManagerInterface } from '../data/characters';

export class MovementProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected characterData: CharacterDataManagerInterface;
  protected playerEvents: PlayerEvents;

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[7] = this.move.bind(this);
    this.processors[13] = this.switchMap.bind(this);

    this.characterData = game.data.getManager('characters');
    this.playerEvents = game.events.player;
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  move(msg: Message): void {
    let character = msg.client.character;
    let walk = character.timers.walk || 0;
    if (msg.timestamp > walk) {

      character.timers.walk = msg.timestamp + 500; //TODO make movement speed configurable

      let dx = msg.data.readUInt8(0) - character.location.x;
      let dy = msg.data.readUInt8(1) - character.location.y;
      let direction = msg.data.readUInt8(2);
      let walkStep = msg.data.readUInt8(3);

      //TODO if WalkStep is run (4), check energy

      character.location.direction = direction;

      //Only moving in one direction
      if (Math.abs(dx) + Math.abs(dy) > 1) {
        this.playerEvents.warp(msg.client, character.location);
        return;
      } else {
        if (//Check if player is already facing that direction
          (dy == -1 && direction == 0) ||
          (dy == 1 && direction == 1) ||
          (dx == -1 && direction == 2) ||
          (dx == 1 && direction == 3)
        ) {
          character.location.x += dx;
          character.location.y += dy;

          //TODO Check If Monsters Notice

        } else {
          character.location.direction = direction;
        }

        this.characterData.update(character, (err, character) => { });
      }

      this.game.clients.sendMessageMap(10, Buffer.from([msg.client.index, character.location.x, character.location.y, character.location.direction, walkStep]), character.location.map, msg.client.index);

      //TODO Check Map Tiles
    }
  }

  switchMap(msg: Message): void {

  }
}
