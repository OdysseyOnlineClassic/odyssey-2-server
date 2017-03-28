import * as NeDB from 'nedb';
import * as Q from 'q';
import * as path from 'path';
import {DataDocument} from './data';

export interface AccountDocument extends DataDocument {
  username: string;
  password: string;
  access: number;
  email?: string;
}

export class AccountDataManager {
  private data: NeDB;

  constructor(dataFolder: string){
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'accounts.data',
      autoload: true
    }
    this.data = new NeDB(options);

    this.data.ensureIndex({
      fieldName: 'username',
      unique: true,
      sparse: false
    });
  }

  createAccount(username: string, cryptPassword: string) {
    return Q.ninvoke(this.data, 'insert', {username: username, password: cryptPassword, access: 0});
  }

  getAccount(username: string) {
    return Q.ninvoke(this.data, 'findOne', {username: username});
  }
}
