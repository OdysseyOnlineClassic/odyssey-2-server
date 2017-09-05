import * as NeDB from 'nedb';

export class GameDataManager<T extends Server.GameDataDocument> {
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

/**
 * Abstract class for our DataDocuments
 * Estbalishes signatures for the clearChanges and saveChanges methods from the @data decorator
 *
 * @export
 * @class DataDocument
 */
export abstract class DataDocument implements Server.DataDocument {
  constructor(
    protected data: NeDB,
    public readonly _id: string, )
  { }

  public async save(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.data.update({ _id: this._id }, this, {}, (err, numUpdated) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}
