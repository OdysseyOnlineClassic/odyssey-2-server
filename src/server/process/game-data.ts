import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { ObjectDataManager } from '../data/objects';

export class GameDataProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected objectData: ObjectDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);
    this.processors[7] = this.sendList.bind(this);

    this.objectData = game.data.getManager('objects');
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  sendList(msg: Message) {
    let list = msg.data.readUInt8(0);
    let max: number = 0;
    let msgId: number = 0;
    switch (list) {
      case 1: //Objects
        max = this.game.options.max.objects;
        msgId = 122;
        this.objectData.getAll(sendList);
        break;
      case 2: //NPCs
        max = this.game.options.max.npcs;
        break;
      case 3: //Halls
        max = this.game.options.max.halls;
        break;
      case 4: //Monsters
        max = this.game.options.max.monsters;
        break;
      case 5: //Magic
        max = this.game.options.max.magic;
        break;
      case 6: //Prefix
        max = this.game.options.max.modifications;
        break;
      case 7: //Suffix
        max = this.game.options.max.modifications;
        break;
      case 8: //Server Options
        //TODO
        break;
    }

    function sendList(err, docs) {
      let data: Buffer = Buffer.allocUnsafe(max);
      for (let i = 0; i < max; i++) {
        if (i < docs.length) {
          data.writeUInt8(docs[i].version, i);
        } else {
          data.writeUInt8(0, i);
        }
      }
      console.log(data.length);
      msg.client.sendMessage(msgId, data);
    }
  }
}
