import * as Loki from 'lokijs';
import { DataManager } from './data-manager';
import { AccountDataManager } from './accounts';

export class Data extends Loki {
  private managers: any;

  constructor(filename: string, options) {
    super(filename, options);

    this.managers = {
      'accounts': new AccountDataManager(this, 'accounts')
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}
