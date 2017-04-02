import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface ObjectDocument extends GameDataDocument {
  name: string,
  sprite: number,
  type: number,
  data: any,
  flags: {},
  class: number,
  level: number,
  sellPrice: number
}

export interface ObjectDataManagerInterface {

}

export class ObjectDataManager implements ObjectDataManagerInterface {

}

interface Callback { (Error, ObjectDocument): void }
