import * as NeDB from 'nedb';
import { GameDataDocument } from './data';
import { GameDataManager } from './data';

export interface BanDocument extends GameDataDocument {
  name: string,
  reason: string,
  unbanDate: number,
  banner: string,
  inUse: boolean,
  computerId: string,
  ip: string
}

export class BanDataManager extends GameDataManager<BanDocument>{
}
