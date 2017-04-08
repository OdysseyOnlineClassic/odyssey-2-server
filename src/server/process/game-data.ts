import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { HallDataManager } from '../data/halls';
import { MagicDataManager } from '../data/magic';
import { MonsterDataManager } from '../data/monsters';
import { NpcDataManager } from '../data/npcs';
import { ObjectDataManager } from '../data/objects';
import { ObjectDocument } from '../data/objects';
import { PrefixDataManager } from '../data/prefixes';
import { SuffixDataManager } from '../data/suffixes';

export class GameDataProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected hallData: HallDataManager;
  protected magicData: MagicDataManager;
  protected monsterData: MonsterDataManager;
  protected npcData: NpcDataManager;
  protected objectData: ObjectDataManager;
  protected prefixData: PrefixDataManager;
  protected suffixData: SuffixDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);

    this.hallData = game.data.getManager('halls');
    this.magicData = game.data.getManager('magic');
    this.monsterData = game.data.getManager('monsters');
    this.npcData = game.data.getManager('npcs');
    this.objectData = game.data.getManager('objects');
    this.prefixData = game.data.getManager('prefixes');
    this.suffixData = game.data.getManager('suffixes');

    this.processors[19] = this.editSendObject.bind(this);
    this.processors[21] = this.updateObject.bind(this);


    this.processors[79] = this.sendObject.bind(this);
    this.processors[80] = this.sendNpc.bind(this);
    this.processors[81] = this.sendHall.bind(this);
    this.processors[82] = this.sendMonster.bind(this);
    this.processors[83] = this.sendMagic.bind(this);
    this.processors[84] = this.sendPrefix.bind(this);
    this.processors[85] = this.sendSuffix.bind(this);
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  sendObject(msg: Message) {
    let index = msg.data.readUInt16BE(0);
    this.objectData.get(index, (err, obj) => {
      let data: Buffer;
      if (obj) {
        data = Buffer.allocUnsafe(14 + obj.name.length);
        data.writeUInt16BE(index, 0);
        data.writeUInt16BE(obj.sprite, 2);
        data.writeUInt8(obj.type, 4);
        data.writeUInt8(obj.data[0], 5);
        data.writeUInt8(obj.data[1], 6);
        data.writeUInt8(obj.data[3], 7);
        data.writeUInt8(obj.flags, 8);
        data.writeUInt8(obj.class, 9);
        data.writeUInt8(obj.level, 10);
        data.writeUInt8(obj.version, 11);
        data.writeUInt16BE(obj.sellPrice, 12);
        data.write(obj.name, 14);
      } else {
        data = Buffer.allocUnsafe(14).fill(0);
        data.writeUInt16BE(index, 0);
      }

      msg.client.sendMessage(31, data);
    });
  }

  editSendObject(msg: Message) {
    let index = msg.data.readUInt16BE(0);
    this.objectData.get(index, (err, obj) => {
      let data: Buffer;
      if (obj) {
        data = Buffer.allocUnsafe(9);
        data.writeUInt16BE(index, 0);
        data.writeUInt8(obj.flags, 2);
        data.writeUInt8(obj.data[0], 3);
        data.writeUInt8(obj.data[1], 4);
        data.writeUInt8(obj.data[2], 5);
        data.writeUInt8(obj.data[3], 6);
        data.writeUInt8(obj.class, 7);
        data.writeUInt8(obj.level, 8);
      } else {
        data = Buffer.allocUnsafe(9).fill(0);
        data.writeUInt16BE(index, 0);
      }
      msg.client.sendMessage(33, data);
    });
  }

  updateObject(msg: Message) {
    if (msg.client.account.access == 0) {
      return;
    }

    let index = msg.data.readUInt16BE(0);

    this.objectData.get(index, (err, obj) => {
      let version: number;
      if (obj) {
        version = (obj.version + 1) % 255;
      } else {
        version = 1;
      }


      obj = {
        index: msg.data.readUInt16BE(0),
        sprite: msg.data.readUInt16BE(2),
        type: msg.data.readUInt8(4),
        flags: msg.data.readUInt8(5),
        data: [
          msg.data.readUInt8(6),
          msg.data.readUInt8(7),
          msg.data.readUInt8(8),
          msg.data.readUInt8(9),
        ],
        class: msg.data.readUInt8(10),
        level: msg.data.readUInt8(11),
        sellPrice: msg.data.readUInt16BE(12),
        name: msg.data.toString('utf-8', 14),
        version: version
      };

      this.objectData.update(obj);
    });
  }

  sendNpc(msg: Message) { }

  sendHall(msg: Message) { }

  sendMonster(msg: Message) { }

  sendMagic(msg: Message) { }

  sendPrefix(msg: Message) { }

  sendSuffix(msg: Message) { }
}
