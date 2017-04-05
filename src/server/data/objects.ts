import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface ObjectDocument extends GameDataDocument {
  name: string,
  sprite: number,
  type: number,
  data: any,
  flags: {},
  class: number,
  level: number,
  sellPrice: number
}

export interface ObjectDataManagerInterface {

}

export class ObjectDataManager implements ObjectDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'objects.data',
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

interface Callback { (Error, ObjectDocument): void }
