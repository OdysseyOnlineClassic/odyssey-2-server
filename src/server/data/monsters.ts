import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MonsterDocument extends GameDataDocument {
  name: string,
  description: string,
  sprite: number,
  flags: {},
  hp: number,
  strength: number,
  armor: number,
  speed: number,
  sight: number,
  agility: number,
  objects: {
    id: number,
    valud: number
  }[],
  experience: number,
  magicDefense: number
}

export interface MonsterDataManagerInterface {

}

export class MonsterDataManager implements MonsterDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'monsters.data',
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

interface Callback { (Error, MonsterDocument): void }
