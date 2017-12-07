import * as NeDB from 'nedb-core';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface MagicDocument extends Server.GameDataDocument {
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
