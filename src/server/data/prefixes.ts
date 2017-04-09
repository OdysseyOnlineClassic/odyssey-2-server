import * as NeDB from 'nedb';
import { GameDataDocument } from './data';
import { GameDataManager } from './data';

export interface PrefixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export class PrefixDataManager extends GameDataManager<PrefixDocument> {
}
