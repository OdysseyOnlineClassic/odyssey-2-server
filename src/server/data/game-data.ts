import * as NeDB from 'nedb';

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
