import * as NeDB from 'nedb';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface MagicDocument extends GameDataDocument {
  name: string,
  level: number,
  class: number,
  icon: number,
  iconType: number,
  castTimer: number,
  description: string
}

export class MagicDataManager extends GameDataManager<MagicDocument> {
}
