import { GameDataManager } from './game-data';

export interface BanDocument extends Server.GameDataDocument {
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
