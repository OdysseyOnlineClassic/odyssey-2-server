import * as NeDB from 'nedb';
import { GameDataDocument } from './data';
import { GameDataManager } from './data';

export interface SuffixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export class SuffixDataManager extends GameDataManager<SuffixDocument> {
}
