import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface ObjectDocument extends GameDataDocument {
  name: string,
  sprite: number,
  type: number,
  data: [number],
  flags: number,
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

  get(index: number, cb: Callback) {
    this.data.findOne({ index: index }, cb);
  }

  getAll(cb: Callback) {
    this.data.find({}).sort({ index: -1 }).exec(cb);
  }

  update(obj: ObjectDocument) {
    this.data.update({ index: obj.index }, obj, { upsert: true });
  }
}

interface Callback { (Error, ObjectDocument): void }
