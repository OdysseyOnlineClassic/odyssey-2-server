import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface suffixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export interface SuffixDataManagerInterface {

}

export class SuffixDataManager implements SuffixDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'suffixes.data',
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

interface Callback { (Error, SuffixDocument): void }
