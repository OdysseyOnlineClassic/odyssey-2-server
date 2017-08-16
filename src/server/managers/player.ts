import { CharacterDocument } from '../data/characters';
import { MapDataManager } from '../data/maps';
import { MapDocument } from '../data/maps';
import { AttributeTypes } from '../data/maps';
import { Directions } from '../data/maps';
import { CharacterDataManagerInterface } from '../data/characters';
import { RawMessage } from '../message';

let Att = AttributeTypes;
const BlockingAttributes = [Att.Wall, Att.Key, Att.Fish, Att.Ore, Att.ProjectileWall, Att.Tree]; //Attribute indexes that out right stop the player always
const InteractiveAttributes = [Att.Warp, Att.Door, Att.TouchPlate, Att.Damage, Att.Script, Att.DirectionalWall, Att.Light, Att.LightDampening]; //Attribute indexes that need to do something when a player moves into the tile
const CheckAttributes = [].concat(BlockingAttributes, InteractiveAttributes);

export class PlayerManager {
  protected mapData: MapDataManager;
  protected characterData: CharacterDataManagerInterface;

  constructor(protected game: Odyssey.GameState) {
    this.mapData = game.data.managers.maps;
    this.characterData = game.data.managers.characters;
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

  move(client: Odyssey.Client, location: Odyssey.Location, walkStep: number) {
    //TODO if WalkStep is run (4), check energy

    let character = client.character;

    let dx = location.x - character.location.x;
    let dy = location.y - character.location.y;

    character.location.direction = location.direction;

    //Only moving in one direction
    if (Math.abs(dx) + Math.abs(dy) > 1) {
      this.warp(client, character.location);
      return;
    }
    new Promise((resolve, reject) => {
      if (//Check if player is already facing that direction
        (dy == -1 && location.direction == 0) ||
        (dy == 1 && location.direction == 1) ||
        (dx == -1 && location.direction == 2) ||
        (dx == 1 && location.direction == 3)
      ) {
        this.mapData.get(character.location.map, (err, map: MapDocument) => {
          //TODO Check Map Tiles
          let tile = map.tiles[location.y][location.x];
          if (CheckAttributes.indexOf(tile.attribute) >= 0 || CheckAttributes.indexOf(tile.attribute2) >= 0) {
            if (BlockingAttributes.indexOf(tile.attribute) >= 0 || BlockingAttributes.indexOf(tile.attribute2) >= 0) {
              return resolve(false);
            }

            let passable = this.resolveAttributeInteraction(client, location, map);
            return resolve(passable)
          }
          character.location.x += dx;
          character.location.y += dy;
          return resolve(true);
        });

      } else {
        character.direction = location.direction;
        resolve(true);
      }
    })
      .then((moved) => {
        if (moved) {
          this.characterData.update(character, (err, character) => { });
          this.game.clients.sendMessageMap(10, Buffer.from([client.index, character.location.x, character.location.y, character.location.direction, walkStep]), character.location.map, client.index);
        }
      })
      .catch((err) => {
        //TODO Error Handling
        console.error(err);
      });
  }

  partMap(client: Odyssey.Client) {
    //TODO need to handle npc exit text
    client.sendMessage(88, Buffer.from([0, 0]));

    let map = client.character.location.map;

    this.game.clients.sendMessageMap(9, Buffer.from([client.index]), map, client.index);
  }

  exitMap(client: Odyssey.Client, exit: number) {
    //TODO check map switch timer
    this.mapData.get(client.character.location.map, (err, map: MapDocument) => {
      let newMap: number;
      let warp: boolean = false;
      let location = client.character.location;
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
          this.warp(client, { map: newMap, x: newX, y: newY })
        } else {
          this.partMap(client);
          client.character.location = { map: newMap, x: location.x, y: location.y };
          this.joinMap(client);
        }
      } else {
        this.partMap(client);
        this.joinMap(client);
      }
    });
  }

  warp(client: Odyssey.Client, location: Odyssey.Location) {
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

  /**
   * Resolves any interaction with complex Attributes
   * Returns boolean determining if the player can move into the tile
   * @param client
   * @param attribute
   * @param data
   */
  protected resolveAttributeInteraction(client, location, map: MapDocument): boolean {
    let currentTile = MapDataManager.getTile(map, client.character.location.x, client.character.location.y);
    let newTile = MapDataManager.getTile(map, location.x, location.y);
    let passable = true;

    //Check for Directional Walls
    if (currentTile.attribute == Att.DirectionalWall) {
      if (!processDirectionalWall(currentTile.attributeData, location.direction, true)) {
        return false;
      }
    }

    if (currentTile.attribute2 == Att.DirectionalWall) {
      if (!processDirectionalWall(currentTile.attributeData2, location.direction, true)) {
        return false;
      }
    }

    if (newTile.attribute == Att.DirectionalWall) {
      if (!processDirectionalWall(newTile.attributeData, location.direction, false)) {
        return false;
      }
    }

    if (newTile.attribute2 == Att.DirectionalWall) {
      if (!processDirectionalWall(newTile.attributeData2, location.direction, false)) {
        return false;
      }
    }

    let attribute = newTile.attribute;
    let data = newTile.attributeData;
    switch (attribute) {
      case Att.Warp:
        passable = false;
        this.warp(client, { map: data[1], x: data[2], y: data[3], direction: client.character.location.direction })
        break;
      case Att.Door:
        break;
      case Att.TouchPlate:
        break;
      case Att.Damage:
        break;
      case Att.Script:
        break;
      case Att.Light:
      case Att.LightDampening:
        break;
      default: //Likekly empty Attribute2
        passable = true;
    }
    return passable;

    /**
     *
     * @param data Attribute Data
     * @param direction
     * @param from True if the player is on this tile. False if the player is moving to this tile.
     */
    function processDirectionalWall(data, direction, from: boolean) {
      let passableBit;
      switch (direction) {
        case Directions.up:
          passableBit = from ? 1 : 3 //To Above, From Below
        case Directions.down:
          passableBit = from ? 2 : 0 //To Below, From Above
        case Directions.left:
          passableBit = from ? 4 : 6 //To Left, From Right
        case Directions.right:
          passableBit = from ? 7 : 5 //To Right, From Left
      }

      //Checks if the bit at passableBit location is set
      return (data[0] & (Math.pow(2, passableBit))) == 0;
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
}
