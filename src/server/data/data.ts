import * as NeDB from 'nedb';
import { AccountDataManager } from './accounts';
import { CharacterDataManager } from './characters';
import { NpcDataManager } from './npcs';
import { ObjectDataManager } from './objects';

export interface DataInterface {
  getManager(name: string);
}

export class Data implements DataInterface {
  private managers: any;

  constructor(dataFolder: string) {
    this.managers = {
      'accounts': new AccountDataManager(dataFolder),
      'characters': new CharacterDataManager(dataFolder),
      'npcs': new NpcDataManager(dataFolder),
      'objects': new ObjectDataManager(dataFolder)
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
  id: number;
  version: number;
}
