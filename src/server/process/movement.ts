import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';
import { PlayerEvents } from '../events/player';
import { CharacterDataManagerInterface } from '../data/characters';
import { MapDataManager } from '../data/maps';
import { MapDocument } from '../data/maps';

export class MovementProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected characterData: CharacterDataManagerInterface;
  protected mapData: MapDataManager;
  protected playerEvents: PlayerEvents;

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[7] = this.move.bind(this);
    this.processors[13] = this.switchMap.bind(this);

    this.characterData = game.data.getManager('characters');
    this.mapData = game.data.getManager('maps');
    this.playerEvents = game.events.player;
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  move(msg: Message): void {
    let character = msg.client.character;

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
        //TODO Check Map Tiles

        character.location.x += dx;
        character.location.y += dy;

        //TODO Check If Monsters Notice

      } else {
        character.location.direction = direction;
      }

      this.characterData.update(character, (err, character) => { });

      this.game.clients.sendMessageMap(10, Buffer.from([msg.client.index, character.location.x, character.location.y, character.location.direction, walkStep]), character.location.map, msg.client.index);
    }
  }

  switchMap(msg: Message): void {
    let exit = msg.data.readUInt8(0);
    this.mapData.get(msg.client.character.location.map, (err, map: MapDocument) => {
      let newMap: number;
      let warp: boolean = false;
      let location = msg.client.character.location;
      let newX = location.x;
      let newY = location.y;
      switch (exit) {
        case 0:
          warp = location.y == 0;
          newY = 11;
          newMap = map.exits.up;
          break;
        case 1:
          warp = location.y == 11;
          newY = 0;
          newMap = map.exits.down;
          break;
        case 2:
          warp = location.x == 0;
          newX = 11;
          newMap = map.exits.left;
          break;
        case 3:
          newMap = map.exits.right
          newX = 0;
          warp = location.x == 11;
          break;
      }

      if (newMap > 0 && newMap <= this.game.options.max.maps) {
        if (warp) {
          this.playerEvents.warp(msg.client, { map: newMap, x: newX, y: newY })
        } else {
          this.playerEvents.partMap(msg.client);
          msg.client.character.location = { map: newMap, x: location.x, y: location.y };
          this.playerEvents.joinMap(msg.client);
        }
      } else {
        this.playerEvents.partMap(msg.client);
        this.playerEvents.joinMap(msg.client);
      }
    });
  }
}
