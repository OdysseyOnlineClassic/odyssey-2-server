import { GameStateInterface } from '../game-state';
import { ClientInterface } from '../clients/client';
import { MapDataManager } from '../data/maps';
import { Location } from '../data/maps';
import { CharacterDocument } from '../data/characters';

export class PlayerEvents {
  protected mapData: MapDataManager;

  constructor(protected game: GameStateInterface) {
    this.mapData = game.data.getManager('maps');
  }

  /**
   * When a client joins the game.
   * 
   * @param {ClientInterface} client 
   * 
   * @memberOf PlayerEvents
   */
  joinGame(client: ClientInterface) {
    return new Promise((resolve, reject) => {
      this.game.clients.sendMessageAll(6, this.serializeJoinCharacter(client.index, client.character), client.index);
      client.sendMessage(24, Buffer.from([]));

      let data: Buffer[] = [];

      for (let i = 0; i < this.game.clients.clients.length; i++) {
        if (this.game.clients.clients[i] && this.game.clients.clients[i].playing) {
          if (i === client.index) {
            continue;
          }
          data.push(this.serializeJoinCharacter(i, this.game.clients.clients[i].character));
        }
      }

      //Compile inventory data

      //Compile equipped data

      client.sendMessage(143, Buffer.from([0])); //TODO this pins outdoor light to 0

      this.game.events.player.joinMap(client);

      resolve();
    });
  }

  /**
   * Must set character location before calling JoinMap
   * Sends Map Data to Client
   * Sends Client Location Update to other Clients on map
   *
   * @param {ClientInterface} client
   *
   * @memberOf PlayerEvents
   */
  joinMap(client: ClientInterface) {
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

  partMap(client: ClientInterface, mapIndex: number) {
    //TODO need to handle npc exit text
    client.sendMessage(88, Buffer.from([0, 0]));
  }

  warp(client: ClientInterface, location: Location) {
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
   * 
   * @protected
   * @param {ClientInterface} client 
   * 
   * @memberOf PlayerEvents
   */
  protected updateLocationToMap(client: ClientInterface) {
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

  /**
   * Serializes basic character data when player joins a game
   * 
   * @protected
   * @param {number} index 
   * @param {CharacterDocument} character 
   * @returns 
   * 
   * @memberOf PlayerEvents
   */
  protected serializeJoinCharacter(index: number, character: CharacterDocument) {
    let joinChar = Buffer.allocUnsafe(6 + character.name.length);
    joinChar.writeUInt8(index, 0);
    joinChar.writeUInt16BE(character.sprite, 1);
    joinChar.writeUInt8(character.status, 3);
    joinChar.writeUInt8(character.guild.id, 4);
    joinChar.writeUInt8(character.stats.maxHp, 5);
    joinChar.write(character.name, 6);

    return joinChar;
  }
}
