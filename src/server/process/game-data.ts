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
  protected prefixData: PrefixDataManager;
  protected suffixData: SuffixDataManager;

  constructor(game: GameStateInterface) {
    super(game);

    this.hallData = game.data.getManager('halls');
    this.magicData = game.data.getManager('magic');
    this.monsterData = game.data.getManager('monsters');
    this.prefixData = game.data.getManager('prefixes');
    this.suffixData = game.data.getManager('suffixes');

    this.processors[81] = this.sendHall.bind(this);
    this.processors[82] = this.sendMonster.bind(this);
    this.processors[83] = this.sendMagic.bind(this);
    this.processors[84] = this.sendPrefix.bind(this);
    this.processors[85] = this.sendSuffix.bind(this);
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  sendHall(msg: Message) { }

  sendMonster(msg: Message) { }

  sendMagic(msg: Message) { }

  sendPrefix(msg: Message) { }

  sendSuffix(msg: Message) { }
}
