import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface AffixDocument extends GameDataDocument {
  name: string,
  type: number,
  value: number,
  natural: boolean
}

export interface AffixDataManagerInterface {

}

export class AffixDataManager implements AffixDataManagerInterface {

}

interface Callback { (Error, AffixDocument): void }
