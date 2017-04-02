import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MagicDocument extends GameDataDocument {
  name: string,
  level: number,
  class: number,
  icon: number,
  iconType: number,
  castTimer: number,
  description: string
}

export interface MagicDataManagerInterface {

}

export class MagicDataManager implements MagicDataManagerInterface {

}

interface Callback { (Error, MagicDocument): void }
