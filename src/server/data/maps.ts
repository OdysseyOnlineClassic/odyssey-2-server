import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MapDocument extends GameDataDocument {
  name: string,
  exits: {
    up: number,
    down: number,
    left: number,
    right: number
  },
  tiles: Tile[][],
  objects: MapObject[],
  monsters: MapMonster[],
  monsterSpawn: MonsterSpawn[],
  doors: Door,
  bootLocation: Location,
  deathLocation: Location,
  flags: {

  },

  resetTime: number,
  hall: number,
  npc: number,
  midi: number,
  keep: boolean,
  lastUpdate: number,
  checksum: number
}

interface Tile {
  ground: Layer,
  background: Layer,
  foreground: Layer,
  attribute: number,
  attribute2: number,
  attributeData: any,
  attributeData2: any
}

interface Layer {
  tile: number,
  alternate: number
}

interface MapMonster {
  id: number,
  x: number,
  y: number,
  direction: number,
  target: {
    index: number,
    monster: boolean,
  },
  hp: number,
  attackTimer: number,
  moveTimer: number,
  frame: number
}

interface MapObject {
  objectId: number,
  value: number,
  timestamp: number,
  x: number,
  y: number,
  prefixId: number,
  suffixId: number
}

export interface Location {
  map: number,
  x: number,
  y: number,
  direction?: number
}

interface Door {
  attribute: number,
  x: number,
  y: number,
  timestamp: number //TODO is this time? For open/close?
}

interface MonsterSpawn {
  monsterId: number,
  rate: number,
  timer: number
}

export interface MapDataManagerInterface {

}

export class MapDataManager implements MapDataManagerInterface {
  private data: NeDB;

  constructor(dataFolder: string) {
    let options: NeDB.DataStoreOptions = {
      filename: dataFolder + path.sep + 'maps.data',
      autoload: true
    }
    this.data = new NeDB(options);

    this.data.ensureIndex({
      fieldName: 'index',
      unique: true,
      sparse: false
    })
  }

  getMap(index: number, cb: Callback) {
    this.data.findOne({ index: index }, cb);
  }
}

interface Callback { (Error, MapDocument): void }
