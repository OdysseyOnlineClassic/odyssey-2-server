import { GameStateInterface } from '../game-state';
import { Client } from '../clients/client';
import { MapDataManager } from '../data/maps';
import { Location } from '../data/maps';

export class PlayerEvents {
  protected mapData: MapDataManager;

  constructor(protected game: GameStateInterface) {
    this.mapData = game.data.getManager('maps');
  }

  /**
   * Must set character location before calling JoinMap
   * Sends Map Data to Client
   * Sends Client Location Update to other Clients on map
   *
   * @param {Client} client
   *
   * @memberOf PlayerEvents
   */
  joinMap(client: Client) {
    let location = client.character.location;
    this.mapData.get(location.map, (err, map) => {
      let data = Buffer.allocUnsafe(13);
      data.writeUInt16BE(location.map, 0);
      data.writeUInt8(location.x, 2);
      data.writeUInt8(location.y, 3);
      data.writeUInt8(location.direction, 4);
      data.writeUInt32BE(map.version, 5);
      data.writeUInt32BE(0, 9);

      client.sendMessage(12, data);

      //TODO Send Door Data

      //TODO Send Other Player Data

      //TODO Send Map Monster Data

      //TODO Send Map Object Data

      this.updateLocationToMap(client);
    });
  }

  partMap(client: Client, mapIndex: number) {
    //TODO need to handle npc exit text
    client.sendMessage(88, Buffer.from([0, 0]));
  }

  warp(client: Client, location: Location) {
    let map = client.character.location.map;
    if (map == location.map) {
      client.character.location = location;
      client.sendMessage(147, Buffer.from([location.x, location.y, location.direction]));
      this.updateLocationToMap(client);
    } else {
      client.character.location = location;
      this.partMap(client, map);
      this.joinMap(client);
    }
  }

  /**
   * Sends client's location to all others on that map
   * @param client
   */
  protected updateLocationToMap(client: Client) {
    let location = client.character.location;
    let dataToMap: Buffer = Buffer.allocUnsafe(7);
    dataToMap.writeUInt8(client.index, 0);
    dataToMap.writeUInt8(location.x, 1);
    dataToMap.writeUInt8(location.y, 2);
    dataToMap.writeUInt8(location.direction, 3);
    dataToMap.writeUInt16BE(client.character.sprite, 4);
    dataToMap.writeUInt8(client.character.status, 6);

    this.game.clients.sendMessageMap(8, dataToMap, location.map, client.index);
  }
}
