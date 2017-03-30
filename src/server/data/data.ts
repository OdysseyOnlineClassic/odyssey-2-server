import * as NeDB from 'nedb';
import { AccountDataManager } from './accounts';
import { CharacterDataManager } from './characters';

export interface DataInterface {
  getManager(name: string);
}

export class Data implements DataInterface {
  private managers: any;

  constructor(dataFolder: string) {
    this.managers = {
      'accounts': new AccountDataManager(dataFolder),
      'characters': new CharacterDataManager(dataFolder)
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}

export interface DataDocument {
  _id?: string;
}
