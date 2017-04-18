import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

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
