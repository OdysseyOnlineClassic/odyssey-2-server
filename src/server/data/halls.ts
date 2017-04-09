import * as NeDB from 'nedb';
import { GameDataDocument } from './data';
import { GameDataManager } from './data';
import { Location } from './maps';

export interface HallDocument extends GameDataDocument {
  name: string,
  price: number,
  upkeep: number,
  startLocation: Location
}

export class HallDataManager extends GameDataManager<HallDocument>{
}
