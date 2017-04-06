import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { NpcDataManager } from '../data/npcs';
import { ObjectDataManager } from '../data/objects';

export class GameDataListProcessor extends MessageProcessor {
  protected objectData: ObjectDataManager;
  protected npcData: NpcDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);

    this.objectData = game.data.getManager('objects');
    this.npcData = game.data.getManager('npcs');
  }

  process(msg: Message): void {
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
        msgId = 123;
        this.npcData.getAll(sendList);
        break;
      case 3: //Halls
        max = this.game.options.max.halls;
        msgId = 124;
        break;
      case 4: //Monsters
        max = this.game.options.max.monsters;
        msgId = 125;
        break;
      case 5: //Magic
        max = this.game.options.max.magic;
        msgId = 126;
        break;
      case 6: //Prefix
        max = this.game.options.max.modifications;
        msgId = 131;
        break;
      case 7: //Suffix
        max = this.game.options.max.modifications;
        msgId = 132;
        break;
      case 8: //Server Options
        //TODO
        msgId = 139;
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
