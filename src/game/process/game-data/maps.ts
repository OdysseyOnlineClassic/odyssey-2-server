// const zlib = require('zlib');
// import { MessageProcessor } from '../process';

// import { Message } from '../../../server/message';
// import { MapDataManager } from '../../data/maps';
// import { MapDocument } from '../../data/maps';

// export class MapProcessor extends MessageProcessor {
//   protected processors: { [id: number]: Server.ProcessFunction } = {};

//   protected mapData: MapDataManager;

//   constructor(game: Server.GameState) {
//     super(game);

//     this.mapData = game.data.managers.maps;

//     this.processors[12] = this.uploadMap.bind(this);
//     this.processors[45] = this.requestMap.bind(this);
//   }

//   requestMap(msg: Message) {
//     this.mapData.get(msg.client.character.location.map, (err, map) => {
//       let data = Buffer.alloc(2677, 0);

//       data.fill(0, 0, 29);
//       data.write(map.name, 0);
//       data.writeUInt32BE(map.version, 30);
//       data.writeUInt16BE(map.npc, 34);
//       data.writeUInt8(map.midi, 36);
//       data.writeUInt16BE(map.exits.up, 37);
//       data.writeUInt16BE(map.exits.down, 39);
//       data.writeUInt16BE(map.exits.left, 41);
//       data.writeUInt16BE(map.exits.right, 43);
//       data.writeUInt16BE(map.bootLocation.map, 45);
//       data.writeUInt8(map.bootLocation.x, 47);
//       data.writeUInt8(map.bootLocation.y, 48);
//       data.writeUInt16BE(map.deathLocation.map, 49);
//       data.writeUInt8(map.deathLocation.x, 51);
//       data.writeUInt8(map.deathLocation.y, 52);
//       data.writeUInt8(map.flags[0], 53);
//       data.writeUInt8(map.flags[1], 54);

//       for (let i = 0; i < this.game.options.max.mapMonsters; i++) {
//         if (map.monsterSpawns[i]) {
//           data.writeUInt16BE(map.monsterSpawns[i].monsterId, 55 + 3 * i);
//           data.writeUInt8(map.monsterSpawns.rate, 57 + 3 * i);
//         } else {
//           data.fill(0, 55 + 3 * i, 55 + 3 * i + 3);
//         }
//       }

//       const offset = 85;
//       const tileLength = 18;
//       let tileOffset;
//       let tile;
//       for (let y = 0; y < 12; y++) {
//         for (let x = 0; x < 12; x++) {
//           tileOffset = (12 * y + x) * tileLength;
//           tileOffset += offset;

//           tile = MapDataManager.getTile(map, x, y);
//           if (!map.tiles[y] || !map.tiles[y][x]) {
//             data.fill(0, tileOffset, tileOffset + tileLength - 1)
//             continue;
//           }

//           data.writeUInt16BE(tile.ground.tile, tileOffset);
//           data.writeUInt16BE(tile.ground.alternate, tileOffset + 2);
//           data.writeUInt16BE(tile.background.tile, tileOffset + 4);
//           data.writeUInt16BE(tile.background.alternate, tileOffset + 6);
//           data.writeUInt16BE(tile.foreground.tile, tileOffset + 8);
//           data.writeUInt16BE(tile.foreground.alternate, tileOffset + 10);
//           data.writeUInt8(tile.attribute, tileOffset + 12);
//           if (tile.attributeData) {
//             data.writeUInt8(tile.attributeData[0] || 0, tileOffset + 13);
//             data.writeUInt8(tile.attributeData[1] || 0, tileOffset + 14);
//             data.writeUInt8(tile.attributeData[2] || 0, tileOffset + 15);
//             data.writeUInt8(tile.attributeData[3] || 0, tileOffset + 16);
//           } else {
//             data.fill(0, tileOffset + 13, tileOffset + 16);
//           }
//           data.writeUInt8(tile.attribute2, tileOffset + 17);
//         }
//       }

//       zlib.deflate(data, (err, buffer: Buffer) => {
//         var compressedData = Buffer.allocUnsafe(buffer.length + 4);
//         buffer.copy(compressedData, 4);
//         compressedData.writeUInt32LE(2677, 0);
//         msg.client.sendMessage(21, compressedData);
//       });
//     });
//   }

//   uploadMap(msg: Message) {
//     let mapIndex = msg.client.character.location.map;
//     if (mapIndex <= 0 || mapIndex > this.game.options.max.maps) {
//       //TODO error log
//       return;
//     }

//     this.mapData.get(mapIndex, (err, map: MapDocument) => {
//       //TODO: we don't have the _id here, need to get map first?
//       Object.assign(map, {
//         index: mapIndex,
//         name: msg.data.toString('utf-8', 0, 29),
//         version: msg.data.readUInt32BE(30),
//         npc: msg.data.readUInt16BE(34),
//         midi: msg.data.readUInt8(36),
//         exits: {
//           up: msg.data.readUInt16BE(37),
//           down: msg.data.readUInt16BE(39),
//           left: msg.data.readUInt16BE(41),
//           right: msg.data.readUInt16BE(43),
//         },
//         bootLocation: {
//           map: msg.data.readUInt16BE(45),
//           x: msg.data.readUInt8(47),
//           y: msg.data.readUInt8(48),
//         },
//         deathLocation: {
//           map: msg.data.readUInt16BE(49),
//           x: msg.data.readUInt8(51),
//           y: msg.data.readUInt8(52)
//         },
//         flags: [
//           msg.data.readUInt8(53),
//           msg.data.readUInt8(54)
//         ],
//         monsterSpawns: [],
//         tiles: []
//       });

//       for (let i = 0; i < this.game.options.max.mapMonsters; i++) {
//         map.monsterSpawns[i] = {
//           monsterId: msg.data.readUInt16BE(55 + 3 * i),
//           rate: msg.data.readUInt8(57 + 3 * i),
//           timer: 0
//         }
//       }

//       const offset = 85;
//       const tileLength = 18;
//       let tileOffset;
//       //TODO make range configurable
//       for (let y = 0; y < 12; y++) {
//         map.tiles[y] = [];
//         for (let x = 0; x < 12; x++) {
//           tileOffset = (12 * y + x) * tileLength;
//           tileOffset += offset;
//           map.tiles[y][x] = {
//             ground: {
//               tile: msg.data.readUInt16BE(tileOffset),
//               alternate: msg.data.readUInt16BE(tileOffset + 2)
//             },
//             background: {
//               tile: msg.data.readUInt16BE(tileOffset + 4),
//               alternate: msg.data.readUInt16BE(tileOffset + 6)
//             },
//             foreground: {
//               tile: msg.data.readUInt16BE(tileOffset + 8),
//               alternate: msg.data.readUInt16BE(tileOffset + 10)
//             },
//             attribute: msg.data.readUInt8(tileOffset + 12),
//             attributeData: [
//               msg.data.readUInt8(tileOffset + 13),
//               msg.data.readUInt8(tileOffset + 14),
//               msg.data.readUInt8(tileOffset + 15),
//               msg.data.readUInt8(tileOffset + 16),
//             ],
//             attribute2: msg.data.readUInt8(tileOffset + 17)
//           }
//         }
//       }

//       this.mapData.update(map, (err, map) => {
//         let mapClients = this.game.clients.getClientsByMap(mapIndex);
//         for (let i = 0; i < mapClients.length; i++) {
//           this.game.managers.player.partMap(mapClients[i]);
//           this.game.managers.player.joinMap(mapClients[i]);
//         }
//       });
//     });
//   }
// }
