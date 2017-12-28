import { MessageProcessor } from './process';

import { Message } from '../../server/message';
import { HallDataManager } from '../data/halls';
import { MagicDataManager } from '../data/magic';
import { MonsterDataManager } from '../data/monsters';
import { NpcDataManager } from '../data/npcs';
import { ObjectDataManager } from '../data/objects';
import { ObjectDocument } from '../data/objects';
import { PrefixDataManager } from '../data/prefixes';
import { SuffixDataManager } from '../data/suffixes';

export class GameDataProcessor extends MessageProcessor {
  protected processors: { [id: number]: Server.ProcessFunction } = {};

  protected hallData: HallDataManager;
  protected magicData: MagicDataManager;
  protected monsterData: MonsterDataManager;
  protected prefixData: PrefixDataManager;
  protected suffixData: SuffixDataManager;

  constructor(game: Server.GameState) {
    super(game);

    this.hallData = game.data.managers.halls;
    this.magicData = game.data.managers.magic;
    this.monsterData = game.data.managers.monsters;
    this.prefixData = game.data.managers.prefixes;
    this.suffixData = game.data.managers.suffixes;

    this.processors[81] = this.sendHall.bind(this);
    this.processors[82] = this.sendMonster.bind(this);
    this.processors[83] = this.sendMagic.bind(this);
    this.processors[84] = this.sendPrefix.bind(this);
    this.processors[85] = this.sendSuffix.bind(this);
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  sendHall(msg: Message) { }

  sendMonster(msg: Message) { }

  sendMagic(msg: Message) { }

  sendPrefix(msg: Message) { }

  sendSuffix(msg: Message) { }
}
