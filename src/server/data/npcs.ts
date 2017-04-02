import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface NpcDocument extends GameDataDocument {
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

export interface NpcDataManagerInterface {

}

export class NpcDataManager implements NpcDataManagerInterface {

}

interface Callback { (Error, NpcDocument): void }
