// import * as NeDB from 'nedb-core';
// import * as Data from './game-data';
// import { DataDocument } from './game-data';

// export class AccountDocument extends DataDocument implements Odyssey.Account {
//   username: string;
//   password: string;
//   access: number;
//   email?: string;

//   protected constructor(protected data: NeDB, readonly _id, username, password, access, email?) {
//     super();

//     this.username = username;
//     this.password = password;
//     this.access = access;
//     this.email = email;
//     this._id = _id;
//   }
// }

// export interface AccountDataManagerInterface {
//   createAccount(username: string, cryptPassword: string): Promise<AccountDocument>,
//   getAccount(username: string): Promise<AccountDocument>
// }

// export class AccountDataManager implements AccountDataManagerInterface {
//   private data: NeDB;
//   private accounts: { [username: string]: AccountDocument } = {};

//   constructor(dataFile: string) {
//     let options: NeDB.DataStoreOptions = {
//       filename: dataFile,
//       autoload: true
//     }
//     this.data = new NeDB(options);

//     this.data.ensureIndex({
//       fieldName: 'username',
//       unique: true,
//       sparse: false
//     });
//   }

//   async createAccount(username: string, cryptPassword: string, email?: string): Promise<AccountDocument> {
//     return new Promise<AccountDocument>((resolve, reject) => {
//       this.data.insert({
//         username: username,
//         password: cryptPassword,
//         access: 0,
//         email: email
//       }, (err, account: any) => {
//         if (err) {
//           return reject(err);
//         }

//         let newAccount = Data.applyProxy(new ConcreteAccount(this.data, account._id, account.username, account.password, account.access, account.email));
//         this.accounts[account.username] = newAccount;

//         resolve(newAccount);
//       });
//     })
//   }

//   async getAccount(username: string): Promise<AccountDocument> {
//     let self = this;
//     return new Promise<AccountDocument>((resolve, reject) => {
//       if (self.accounts[username]) {
//         return resolve(self.accounts[username]);
//       }

//       self.data.findOne({ username: username }, (err, account: AccountDocument) => {
//         if (!account) {
//           return resolve(null);
//         }

//         let newAccount = Data.applyProxy(new ConcreteAccount(self.data, account._id, account.username, account.password, account.access, account.email));
//         self.accounts[account.username] = newAccount;
//         resolve(newAccount);
//       });
//     })
//   }
// }

// /**
//  * Private implementation for Factory Pattern
//  *
//  * @class ConcreteAccount
//  * @extends {AccountDocument}
//  */
// class ConcreteAccount extends AccountDocument {
//   constructor(protected data: NeDB, _id, username, password, access, email?) {
//     super(data, _id, username, password, access, email);
//   }
// }
