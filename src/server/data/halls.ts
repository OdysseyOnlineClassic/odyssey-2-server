import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';
import { Location } from './maps';

export interface HallDocument extends GameDataDocument {
  name: string,
  price: number,
  upkeep: number,
  startLocation: Location
}

export interface HallDataManagerInterface {

}

export class HallDataManager implements HallDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'halls.data',
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

interface Callback { (Error, HallDocument): void }
