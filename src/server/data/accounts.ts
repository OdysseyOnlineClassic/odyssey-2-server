import * as NeDB from 'nedb';
import * as Q from 'q';

export interface AccountDocument {
  _id?: number;
  username: string;
  password: string;
  email?: string;
}

export class AccountDataManager {
  private data: NeDB;
  constructor(dataFolder: string){
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + 'accounts.data',
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
    return Q.ninvoke(this.data, 'insert', {username: username, password: cryptPassword});
  }

  getAccount(username: string) {
    return Q.ninvoke(this.data, 'findOne', {username: username});
  }
}
