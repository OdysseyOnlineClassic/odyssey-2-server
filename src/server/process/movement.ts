import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';
import { PlayerManager } from '../managers/player';
import { CharacterDataManagerInterface } from '../data/characters';
import { MapDataManager } from '../data/maps';
import { MapDocument } from '../data/maps';

export class MovementProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected characterData: CharacterDataManagerInterface;
  protected mapData: MapDataManager;
  protected playerEvents: PlayerManager;

  constructor(game: Odyssey.GameState) {
    super(game);

    this.processors[7] = this.move.bind(this);
    this.processors[13] = this.switchMap.bind(this);

    this.characterData = game.data.managers.characters;
    this.mapData = game.data.managers.maps;
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
