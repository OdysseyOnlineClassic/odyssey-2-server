import * as NeDB from 'nedb';
import { AccountDataManager } from './accounts';
import { CharacterDataManager } from './characters';
import { HallDataManager } from './halls';
import { MagicDataManager } from './magic';
import { MonsterDataManager } from './monsters';
import { NpcDataManager } from './npcs';
import { ObjectDataManager } from './objects';
import { PrefixDataManager } from './prefixes';
import { SuffixDataManager } from './suffixes';

export interface DataInterface {
  getManager(name: string);
}

export class Data implements DataInterface {
  private managers: any;

  constructor(dataFolder: string) {
    this.managers = {
      'accounts': new AccountDataManager(dataFolder),
      'characters': new CharacterDataManager(dataFolder),
      'halls': new HallDataManager(dataFolder),
      'magic': new MagicDataManager(dataFolder),
      'monsters': new MonsterDataManager(dataFolder),
      'npcs': new NpcDataManager(dataFolder),
      'objects': new ObjectDataManager(dataFolder),
      'prefixes': new PrefixDataManager(dataFolder),
      'suffixes': new SuffixDataManager(dataFolder)
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}

export interface DataDocument {
  _id?: string;
}

/**
 * Represents game data that's indexed numerically and versioned to reduce load times
 *
 * @export
 * @interface GameDataDocument
 * @extends {DataDocument}
 */
export interface GameDataDocument extends DataDocument {
  index: number;
  version: number;
}
