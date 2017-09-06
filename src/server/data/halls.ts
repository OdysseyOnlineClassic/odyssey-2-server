import * as NeDB from 'nedb';
import { GameDataManager } from './game-data';

export interface HallDocument extends Server.GameDataDocument {
  name: string,
  price: number,
  upkeep: number,
  startLocation: Odyssey.Location
}

export class HallDataManager extends GameDataManager<HallDocument>{
}
