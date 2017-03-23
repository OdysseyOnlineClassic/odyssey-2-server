import { DataManager } from './data-manager';

export interface AccountDocument {
  $loki?: number;
  username: string;
  password: string;
  email?: string;
}

export class Account {
  constructor(private account: AccountDocument) {
  }
}

export class AccountDataManager<AccountDocument> extends DataManager<AccountDocument> {

  protected createCollection(collectionName: string) {
    return this.data.addCollection<AccountDocument>(collectionName, {});
  }

  createAccount(username: string, password: string) {
    console.log(`Create Account in DB ${username}:${password}`);
    this.collection.insert({username: username, password: password});
  }

  getAccount() {

  }
}
