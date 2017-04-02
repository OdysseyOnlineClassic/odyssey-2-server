import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MonsterDocument extends GameDataDocument {
  name: string,
  description: string,
  sprite: number,
  flags: {},
  hp: number,
  strength: number,
  armor: number,
  speed: number,
  sight: number,
  agility: number,
  objects: {
    id: number,
    valud: number
  }[],
  experience: number,
  magicDefense: number
}

export interface MonsterDataManagerInterface {

}

export class MonsterDataManager implements MonsterDataManagerInterface {

}

interface Callback { (Error, MonsterDocument): void }
