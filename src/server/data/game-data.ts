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

/**
 * Abstract class for our DataDocuments
 * Estbalishes signatures for the clearChanges and saveChanges methods from the @data decorator
 *
 * @export
 * @class DataDocument
 */
@data
export abstract class DataDocument {
  readonly _id: string;
  _autosave: boolean;
  clearChanges() { };
  saveChanges() { };
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

export function data(target: any) {
  target.prototype._changedKeys = [];
  target.prototype._autosave = true;

  target.prototype.clearChanges = function clearChanges() {
    this._changedKeys = [];
  }

  target.prototype.getSets = function getSets() {
    let set = {};
    let key;
    for (let i = 0; i < this._changedKeys.length; i++) {
      key = this._changedKeys[i];
      set[key] = this[key];
    }

    return set;
  }

  target.prototype.markChanged = function markChanged(key) {
    this._changedKeys.push(key);
    if (this._autosave) {
      this.saveChanges();
    }
  }

  target.prototype.saveChanges = function saveChanges() {
    return new Promise((resolve, reject) => {
      let sets = this.getSets();
      console.log(sets);
      this.data.update({ _id: this._id }, { $set: sets }, {}, (err, numAffected) => {
        if (err) {
          return reject(err);
        }

        if (numAffected != 1) {
          return reject(`Save Changes number affected != 1 (${numAffected})`);
        }
        this.clearChanges();
        resolve(this);
      });
    });
  }
}

export function trackProperty(target: any, key: string) {
  if (!target.markChanged) {
    data(target.constructor);
  }
  let _val = target[key];

  let getter = function () {
    return _val;
  };

  let setter = function (newValue) {
    _val = newValue;
    this.markChanged(key);
  }

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  }
}
