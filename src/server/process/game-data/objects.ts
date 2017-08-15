import { MessageProcessor } from '../process';
import { ProcessFunction } from '../process';
import { Message } from '../../message';
import { ObjectDataManager } from '../../data/objects';
import { ObjectDocument } from '../../data/objects';

export class ObjectDataProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected objectData: ObjectDataManager;

  constructor(game: Odyssey.GameState) {
    super(game);

    this.objectData = game.data.managers.objects;

    this.processors[19] = this.editSendObject.bind(this);
    this.processors[21] = this.updateObject.bind(this);
    this.processors[79] = this.sendObject.bind(this);
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  /**
   * Serializes an object into the standard MsgId 31 serialization
   *
   * @param {number} index Index is required because we may be serializing a null object
   * @param {ObjectDocument} obj
   * @returns {Buffer}
   *
   * @memberOf GameDataProcessor
   */
  serializeObject(index: number, obj?: ObjectDocument): Buffer {
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

    return data;
  }

  sendObject(msg: Message) {
    let index = msg.data.readUInt16BE(0);
    this.objectData.get(index, (err, obj) => {
      msg.client.sendMessage(31, this.serializeObject(index, obj));
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

      this.objectData.update(obj, (err) => {
        if (err) {
          throw err;
        }

        this.game.clients.sendMessageAll(31, this.serializeObject(obj.index, obj))
      });
    });
  }
}
