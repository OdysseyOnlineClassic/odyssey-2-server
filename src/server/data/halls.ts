import * as NeDB from 'nedb';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface HallDocument extends GameDataDocument {
  name: string,
  price: number,
  upkeep: number,
  startLocation: Odyssey.Location
}

export class HallDataManager extends GameDataManager<HallDocument>{
}
