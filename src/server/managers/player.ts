import { CharacterDocument } from '../data/characters';
import { Location } from '../data/maps';
import { MapDataManager } from '../data/maps';
import { RawMessage } from '../message';

export class PlayerManager {
  protected mapData: MapDataManager;

  constructor(protected game: Odyssey.GameState) {
    this.mapData = game.data.managers.maps;
  }

  /**
   * When a client joins the game.
   *
   * @param {Odyssey.Client} client
   * @throws {Error} Expects client to have a character
   *
   * @memberOf PlayerEvents
   */
  joinGame(client: Odyssey.Client) {
    return new Promise((resolve, reject) => {
      if (!client.character) {
        throw new Error('Client does not have a character');
      }

      let raw = new RawMessage();
      this.game.clients.sendMessageAll(6, this.serializeJoinCharacter(client.index, client.character), client.index);
      client.sendMessage(24, Buffer.from([]));

      for (let i = 1; i <= this.game.clients.clients.length; i++) {
        if (this.game.clients.clients[i] && this.game.clients.clients[i].playing) {
          raw.addMessage(6, this.serializeJoinCharacter(i, this.game.clients.clients[i].character));
        }
      }

      //TODO Map Boot Location

      //Compile inventory data
      let invData: Buffer;
      for (let i = 0; i < this.game.options.max.inventoryObjects; i++) {
        if (client.character.inventory[i]) {
          invData = Buffer.allocUnsafe(9);
          invData.writeUInt8(i, 0);
          invData.writeUInt16BE(client.character.inventory[i].index, 1);
          invData.writeUInt32BE(client.character.inventory[i].value, 3);
          invData.writeUInt8(client.character.inventory[i].prefix, 7);
          invData.writeUInt8(client.character.inventory[i].suffix, 8);

          raw.addMessage(17, invData);
        }
      }

      if (client.character.ammo) {
        raw.addMessage(19, Buffer.from([client.character.ammo]));
      }

      for (let i = 0; i < 5; i++) {
        if (client.character.equipped[i]) {
          invData = Buffer.allocUnsafe(8);
          invData.writeUInt16BE(client.character.equipped[i].index, 0);
          invData.writeUInt32BE(client.character.equipped[i].value, 2);
          invData.writeUInt8(client.character.inventory[i].prefix, 6);
          invData.writeUInt8(client.character.inventory[i].suffix, 7);

          raw.addMessage(115, invData);
        }
      }

      raw.sendMessage(client);

      //TODO outdoor light set to 0, need to implement outdoor light
      client.sendMessage(143, Buffer.from([0]));

      this.joinMap(client);

      client.playing = true;

      resolve();
    });
  }

  /**
   * Must set character location before calling JoinMap
   * Sends Map Data to Client
   * Sends Client Location Update to other Clients on map
   *
   * @param {Odyssey.Client} client
   *
   * @memberOf PlayerEvents
   */
  joinMap(client: Odyssey.Client) {
    let location = client.character.location;
    this.mapData.get(location.map, (err, map) => {
      if (!map) {
        //initialize blank map
        map = {
          version: 0
        };
      }
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
      this.sendMapPlayers(client);
    });
  }

  partMap(client: Odyssey.Client) {
    //TODO need to handle npc exit text
    client.sendMessage(88, Buffer.from([0, 0]));
  }

  warp(client: Odyssey.Client, location: Location) {
    let map = client.character.location.map;
    if (map == location.map) {
      client.character.location = location;
      client.sendMessage(147, Buffer.from([location.x, location.y, location.direction]));
      this.updateLocationToMap(client);
    } else {
      this.partMap(client);
      client.character.location = location;
      this.joinMap(client);
    }
  }

  protected sendMapPlayers(client: Odyssey.Client) {
    let map = client.character.location.map;
    let clients = this.game.clients.getClientsByMap(map);
    let msg = new RawMessage();

    let buffer = Buffer.allocUnsafe(7);
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].index != client.index) {
        buffer.writeUInt8(clients[i].index, 0);
        buffer.writeUInt8(clients[i].character.location.x, 1);
        buffer.writeUInt8(clients[i].character.location.y, 2);
        buffer.writeUInt8(clients[i].character.location.direction, 3);
        buffer.writeUInt16BE(clients[i].character.sprite, 4);
        buffer.writeUInt8(clients[i].character.status, 6);

        msg.addMessage(8, buffer);
      }
    }

    msg.sendMessage(client);
  }

  /**
   * Sends client's location to all others on that map
   *
   * @protected
   * @param {Odyssey.Client} client
   *
   * @memberOf PlayerEvents
   */
  protected updateLocationToMap(client: Odyssey.Client) {
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
