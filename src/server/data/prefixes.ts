import * as NeDB from 'nedb';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface PrefixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export class PrefixDataManager extends GameDataManager<PrefixDocument> {
}
