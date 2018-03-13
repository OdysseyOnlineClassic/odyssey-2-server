import * as bcrypt from 'bcryptjs';
import * as NeDB from 'nedb-core';
import * as Data from '../../data/game-data';

export class AccountData {
  protected data: NeDB;

  constructor(dataFile: string) {
    dataFile = dataFile || 'accounts.data';
    let options: NeDB.DataStoreOptions = {
      filename: dataFile,
      autoload: true
    }
    this.data = new NeDB(options);

    // username is required and cannot be null
    this.data.ensureIndex({
      fieldName: 'username',
      unique: true,
      sparse: false
    });
  }

  public async createAccount(username: string, password: string, email?: string): Promise<Account> {
    const salt = bcrypt.genSaltSync();
    const cryptPassword = bcrypt.hashSync(password, salt);

    return new Promise<Account>((resolve, reject) => {
      this.data.insert({
        username: username,
        password: cryptPassword,
        access: 0,
        email: email
      }, (err, account: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(Data.applyProxy(new ConcreteAccount(this.data, account._id, account.username, account.password, account.access, account.email));
      });
    });
  }

  public async getAccount(username: string): Promise<Account> {
    return new Promise<Account>((resolve, reject) => {
      this.data.findOne({ username: username }, (err, account) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(Data.applyProxy(account));
      });
    });
  }
}

export class Account {
  username: string;
  password: string;
  access: number;
  email?: string;

  protected constructor(data: Nedb, readonly _id, username, password, access, email?) {

  }
}

class ConcreteAccount extends Account {
  constructor(data: Nedb, readonly _id, username, password, access, email?) {
    super(data, _id, username, password, access, email);
  }
}
