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
  bootLocation: Odyssey.Location,
  deathLocation: Odyssey.Location,
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

export enum AttributeTypes {
  Wall = 1,
  Warp,
  Key,
  Door,
  Keep,
  NoAttack,
  ObjectSpawn,
  TouchPlate,
  Damage,
  NoMonster,
  Script,
  Click,
  Fish,
  Ore,
  ProjectileWall,
  Tree,
  DirectionalWall,
  S,
  Light,
  LightDampening,
  O1,
  O2
}

export enum Directions {
  up = 0,
  down,
  left,
  right
}

export class MapDataManager extends GameDataManager<MapDocument> {
  /**
   * Provides a normalized (x,y) way to get tiles.
   * Currently due to legacy code, map tiles are organized y,x.
   * This method abstracts that away, so if it changes calls to this method will still be valid.
   *
   * @static
   * @param {MapDocument} map
   * @param {number} x
   * @param {number} y
   * @returns
   * @memberof MapDataManager
   */
  static getTile(map: MapDocument, x: number, y: number) {
    return map.tiles[y][x];
  }
}
