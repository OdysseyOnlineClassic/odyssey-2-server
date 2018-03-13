import * as NeDB from 'nedb-core';

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
 *
 * @export
 * @class DataDocument
 */
export abstract class DataDocument {
  readonly _id: string;
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
    target.saveChange(property);
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
    parent.saveChange(key);
    return true;
  }
}

export function data(target: any) {
  target.prototype.saveChange = async function saveChange(key) {
    if (this[key] instanceof Function) {
      return;
    }

    let set = {}
    set[key] = this[key];
    this.data.update({ _id: this._id }, { $set: set }, {}, (err, numAffected) => {
      if (err) {
        //TODO handle error
      }

      if (numAffected != 1) {
        //TODO Handle error
      }
    });
  }
}

export function applyProxy(obj: any, ignore: [string] = ['data']) {
  if (!obj) {
    return null;
  }

  Object.keys(obj).forEach((key) => {
    let ignored = (ignore.findIndex(value => value == key) > -1);
    if (obj[key] instanceof Object && !ignored) {
      let p = new Proxy(obj[key], { set: subSetter(obj, key) });
      obj[key] = p;
    }
  });

  return new Proxy(obj, { set: setter });
}
