import * as NeDB from 'nedb';
import * as path from 'path';
import { AccountDataManager } from './accounts';
import { CharacterClassDataManager } from './classes';
import { CharacterDataManager } from './characters';
import { HallDataManager } from './halls';
import { GuildDataManager } from './guilds';
import { MagicDataManager } from './magic';
import { MapDataManager } from './maps';
import { MonsterDataManager } from './monsters';
import { NpcDataManager } from './npcs';
import { ObjectDataManager } from './objects';
import { PrefixDataManager } from './prefixes';
import { SuffixDataManager } from './suffixes';

export interface DataInterface {
  getManager(name: string);
}

export class Data implements DataInterface {
  private managers: any;

  constructor(dataFolder: string) {
    let dataRoot = dataFolder + path.sep;
    this.managers = {
      'accounts': new AccountDataManager(dataRoot + 'accounts.data'),
      'characters': new CharacterDataManager(dataRoot + 'characters.data'),
      'classes': new CharacterClassDataManager(dataRoot + 'classes.data'),
      'guilds': new GuildDataManager(dataRoot + 'guilds.data'),
      'halls': new HallDataManager(dataRoot + 'halls.data'),
      'magic': new MagicDataManager(dataRoot + 'magic.data'),
      'maps': new MapDataManager(dataRoot + 'maps.data'),
      'monsters': new MonsterDataManager(dataRoot + 'monsters.data'),
      'npcs': new NpcDataManager(dataRoot + 'npcs.data'),
      'objects': new ObjectDataManager(dataRoot + 'objects.data'),
      'prefixes': new PrefixDataManager(dataRoot + 'prefixes.data'),
      'suffixes': new SuffixDataManager(dataRoot + 'suffixes.data')
    }
  }

  getManager(name: string) {
    return this.managers[name];
  }
}

export class GameDataManager<T extends GameDataDocument> {
  protected data: NeDB;

  constructor(dataFile: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFile,
      autoload: true
    }

    this.data = new NeDB(options);

    this.data.ensureIndex({
      fieldName: 'index',
      unique: true,
      sparse: false
    });
  }


  get(index: number, cb: { (Error, T) }) {
    this.data.findOne({ index: index }, cb);
  }

  getAll(cb: { (Error, [T]) }) {
    this.data.find({}).sort({ index: -1 }).exec(cb);
  }

  update(doc: T, cb: { (Error, T) }) {
    this.data.update({ index: doc.index }, doc, { upsert: true }, cb);
  }
}

export interface DataDocument {
  _id?: string
}

/**
 * Represents game data that's indexed numerically and versioned to reduce load times
 *
 * @export
 * @interface GameDataDocument
 * @extends {DataDocument}
 */
export interface GameDataDocument {
  index: number;
  version: number;
}
