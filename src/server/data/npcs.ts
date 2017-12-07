import * as NeDB from 'nedb-core';
import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface NpcDocument extends Server.GameDataDocument {
  name: string,
  joinText: string,
  leaveText: string,
  sayText: string[],
  flags: {},
  trades: Trade[]
}

interface Trade {
  giveId: string,
  giveValue: number,
  takeId: string,
  takeValue: number
}

export class NpcDataManager extends GameDataManager<NpcDocument> {
}
