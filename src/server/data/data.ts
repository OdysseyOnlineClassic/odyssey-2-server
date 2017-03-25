import * as NeDB from 'nedb';
import { AccountDataManager } from './accounts';

export class Data {
  private managers: any;

  constructor(dataFolder: string) {
    this.managers = {
      'accounts': new AccountDataManager(dataFolder)
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}
