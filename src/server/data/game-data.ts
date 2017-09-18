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
@data
export abstract class DataDocument {
  readonly _id: string;
  clearChanges() { };
  save() { };
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

export function setter(target, property, value, receiver) {
  if (value instanceof Object) {
    //Object or array, need to establish a "sub-proxy"
    let p = new Proxy(value, { set: subSetter(target, property) });
    target[property] = p;
  } else {
    target[property] = value;
  }

  if (!(value instanceof Function)) {
    target.markChanged(property);
  }

  return true;
}

function subSetter(parent, key) {
  return (target, property, value, receiver) => {
    if (value instanceof Object) {
      let p = new Proxy(value, { set: subSetter(parent, key) });
      target[property] = p;
    } else {
      target[property] = value;
    }
    parent.markChanged(key);
    return true;
  }
}

export function data(target: any) {
  target.prototype._changedKeys = [];
  target.prototype._trackedKeys = target.prototype._trackedKeys || {};

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

  target.prototype.markChanged = async function markChanged(key) {
    if (typeof this[key] == 'function') {
      return;
    }
    let save = this._trackedKeys[key] ? this._trackedKeys[key].autoSave : true;
    return new Promise((resolve, reject) => {
      if (save === false) {
        this._changedKeys.push(key);
        resolve();
      } else if (save === true) {
        let set = {}
        set[key] = this[key];
        this.data.update({ _id: this._id }, { $set: { set } }, {}, (err, numAffected) => {
          if (err) {
            reject(err);
          }

          if (numAffected != 1) {
            reject(`Save Changes number affected != 1 (${numAffected})`);
          }
          resolve()
        });
      }
    });
  }

  target.prototype.save = function saveChanges() {
    return new Promise((resolve, reject) => {
      let sets = this.getSets();
      this.data.update({ _id: this._id }, { $set: sets }, {}, (err, numAffected) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

export function trackProperty(autoSave: boolean = true) {
  return function track(target: any, key: string) {
    let trackedKeys = target.constructor.prototype._trackedKeys || {};
    trackedKeys[key] = {
      autoSave: (autoSave == true)
    }
  }
}
