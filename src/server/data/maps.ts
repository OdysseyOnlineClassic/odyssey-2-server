import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface MapDocument extends GameDataDocument {
  name: string,
  exits: {
    up: number,
    down: number,
    left: number,
    right: number
  },
  tiles: Tile[][],
  objects?: MapObject[],
  monsters?: MapMonster[],
  monsterSpawns: MonsterSpawn[],
  doors?: Door,
  bootLocation: Location,
  deathLocation: Location,
  flags: {

  },

  resetTime?: number,
  hall?: number,
  npc: number,
  midi: number,
  keep?: boolean,
  lastUpdate?: number,
  checksum?: number
}

interface Tile {
  ground: Layer,
  background: Layer,
  foreground: Layer,
  attribute: number,
  attribute2: number,
  attributeData: number[],
  attributeData2?: number[]
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

export class MapDataManager extends GameDataManager<MapDocument> {
}
