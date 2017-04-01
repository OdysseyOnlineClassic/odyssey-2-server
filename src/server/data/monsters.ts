import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MonsterDocument extends GameDataDocument {

}

export interface MonsterDataManagerInterface {

}

export class MonsterDataManager implements MonsterDataManagerInterface {

}

interface Callback { (Error, MonsterDocument): void }
