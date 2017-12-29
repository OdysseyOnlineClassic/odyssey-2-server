import * as NeDB from 'nedb-core';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface MonsterDocument extends Server.GameDataDocument {
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

export class MonsterDataManager extends GameDataManager<MonsterDocument> {
}
