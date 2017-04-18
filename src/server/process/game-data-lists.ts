import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { HallDataManager } from '../data/halls';
import { MagicDataManager } from '../data/magic';
import { MonsterDataManager } from '../data/monsters';
import { NpcDataManager } from '../data/npcs';
import { ObjectDataManager } from '../data/objects';
import { PrefixDataManager } from '../data/prefixes';
import { SuffixDataManager } from '../data/suffixes';

export class GameDataListProcessor extends MessageProcessor {
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
  }

  process(msg: Message): void {
    let list = msg.data.readUInt8(0);
    let max: number = 0;
    let msgId: number = 0;

    switch (list) {
      case 1: //Objects
        max = this.game.options.max.objects;
        msgId = 122;
        this.objectData.getAll(sendList.bind(this));
        break;
      case 2: //NPCs
        max = this.game.options.max.npcs;
        msgId = 123;
        this.npcData.getAll(sendList.bind(this));
        break;
      case 3: //Halls
        max = this.game.options.max.halls;
        msgId = 124;
        this.hallData.getAll(sendList.bind(this));
        break;
      case 4: //Monsters
        max = this.game.options.max.monsters;
        msgId = 125;
        this.monsterData.getAll(sendList.bind(this));
        break;
      case 5: //Magic
        max = this.game.options.max.magic;
        msgId = 126;
        this.magicData.getAll(sendList.bind(this));
        break;
      case 6: //Prefix
        max = this.game.options.max.modifications;
        msgId = 131;
        this.prefixData.getAll(sendList.bind(this));
        break;
      case 7: //Suffix
        max = this.game.options.max.modifications;
        msgId = 132;
        this.suffixData.getAll(sendList.bind(this));
        break;
      case 8: //Server Options
        sendServerOptions.bind(this)();

        //TODO, short circuiting some packets to try to skip some client data
        //"All data sent" - still need to send guild data after this
        msg.client.sendMessage(140, Buffer.allocUnsafe(0));
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
      msg.client.sendMessage(msgId, data);
    }

    function sendServerOptions() {
      let options = this.game.options;
      let data = Buffer.allocUnsafe(24);

      let stats: number[] = [
        options.stats.stength,
        options.stats.endurance,
        options.stats.intelligence,
        options.stats.concentration,
        options.stats.constitution,
        options.stats.stamina,
        options.stats.wisdom,
        options.moneyObject
      ]

      Buffer.from(stats).copy(data);
      data.writeUInt16BE(options.costs.durability, 8);
      data.writeUInt16BE(options.costs.strength, 10);
      data.writeUInt16BE(options.costs.modifier, 12);
      data.writeUInt8(options.guilds.joinLevel, 14);
      data.writeUInt8(options.guilds.createLevel, 15);
      data.writeUInt32BE(options.guilds.joinPrice, 16);
      data.writeUInt32BE(options.guilds.createPrice, 20);

      msg.client.sendMessage(139, data);
    }
  }
}
