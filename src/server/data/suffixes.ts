import * as NeDB from 'nedb-core';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface SuffixDocument extends Server.GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export class SuffixDataManager extends GameDataManager<SuffixDocument> {
}
