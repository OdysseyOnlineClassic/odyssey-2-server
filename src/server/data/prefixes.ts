import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface PrefixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export interface PrefixDataManagerInterface {

}

export class PrefixDataManager implements PrefixDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'prefixes.data',
      autoload: true
    }
    this.data = new NeDB(options);

    this.data.ensureIndex({
      fieldName: 'index',
      unique: true,
      sparse: false
    });
  }

  getAll(cb: Callback) {
    this.data.find({}).sort({ index: -1 }).exec(cb);
  }
}

interface Callback { (Error, PrefixDocument): void }
