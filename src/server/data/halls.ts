import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';
import { Location } from './maps';

export interface HallDocument extends GameDataDocument {
  name: string,
  price: number,
  upkeep: number,
  startLocation: Location
}

export interface HallDataManagerInterface {

}

export class HallDataManager implements HallDataManagerInterface {

}

interface Callback { (Error, HallDocument): void }
