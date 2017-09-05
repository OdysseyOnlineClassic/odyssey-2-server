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

export function data(target: any) {
  target.prototype._autoSave = false;
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
    let save = this._trackedKeys[key].autoSave;
    if (save == false) {
      this._changedKeys.push(key);
      return Promise.resolve();
    } else if (save === true) {
      let set = {}
      set[key] = this[key];
      this.data.update({ _id: this._id }, { $set: { set } }, {}, (err, numAffected) => {
        if (err) {
          return Promise.reject(err);
        }

        if (numAffected != 1) {
          return Promise.reject(`Save Changes number affected != 1 (${numAffected})`);
        }
        return Promise.resolve();
      });
    }
  }

  target.prototype.save = function saveChanges() {
    return new Promise((resolve, reject) => {
      let sets = this.getSets();
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

export function trackProperty(autoSave: boolean = true) {
  return function track(target: any, key: string) {
    let trackedKeys = target.constructor.prototype._trackedKeys || {};
    trackedKeys[key] = {
      autoSave: (autoSave == true)
    }

    let _val = target[key];

    let getter = function () {
      return _val;
    };

    let setter = function (newValue) {
      if (newValue != null && typeof newValue === 'object') {
        //Have to handle arrays and objects
        if (Array.isArray(newValue)) {

        } else {
          let props = Object.getOwnPropertyNames(newValue);
          for (let i = 0; i < props.length; i++) {
            let propValue;
            let prop = props[i];
            console.log(prop);
            let descriptor = Object.getOwnPropertyDescriptor(newValue, prop);
            let dataObj = this;

            if (descriptor.set) {
              descriptor.set = function (val) {
                dataObj.markChanged(key);
                descriptor.set(val);
              }
            } else {
              descriptor.set = function (val) {
                dataObj.markChanged(key);
                propValue = val;
              }
            }

            if (!descriptor.get) {
              descriptor.get = function () {
                return propValue;
              }
            }

            delete (descriptor.writable);
            delete (descriptor.value);

            Object.defineProperty(newValue, prop, descriptor);
          }
        }
      }
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
}

function arraySetter(arr, autoSave: boolean) {

}

function objectSetter(obj, autoSave: boolean) {

}
