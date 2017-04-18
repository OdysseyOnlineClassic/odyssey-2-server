import { GameStateInterface } from '../game-state';
import { Client } from '../clients/client';
import { MapDataManager } from '../data/maps';
import { Location } from '../data/maps';

export class PlayerEvents {
  protected mapData: MapDataManager;

  constructor(protected game: GameStateInterface) {
    this.mapData = game.data.getManager('maps');
  }

  joinMap(client: Client, location: Location) {
    this.mapData.get(location.map, (err, map) => {
      client.character.location = location;
      let data = Buffer.allocUnsafe(13);
      data.writeUInt16BE(location.map, 0);
      data.writeUInt8(location.x, 2);
      data.writeUInt8(location.y, 3);
      data.writeUInt8(location.direction, 4);
      data.writeUInt32BE(map.version, 5);
      data.writeUInt32BE(0, 9);

      client.sendMessage(12, data);
    });
  }
}
