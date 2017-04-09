import * as NeDB from 'nedb';
import { DataDocument } from './data';

export interface AccountDocument extends DataDocument {
  username: string;
  password: string;
  access: number;
  email?: string;
}

export interface AccountDataManagerInterface {
  createAccount(username: string, cryptPassword: string, cb: Callback): void,
  getAccount(username: string, cb: Callback): void
}

export class AccountDataManager implements AccountDataManagerInterface {
  private data: NeDB;

  constructor(dataFile: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFile,
      autoload: true
    }
    this.data = new NeDB(options);

    this.data.ensureIndex({
      fieldName: 'username',
      unique: true,
      sparse: false
    });
  }

  createAccount(username: string, cryptPassword: string, cb: Callback): void {
    this.data.insert({ username: username, password: cryptPassword, access: 0 }, cb);
  }

  getAccount(username: string, cb: Callback): void {
    this.data.findOne({ username: username }, cb);
  }
}

interface Callback { (Error, AccountDocument): void }
