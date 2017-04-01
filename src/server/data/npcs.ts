import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface NpcDocument extends GameDataDocument {

}

export interface NpcDataManagerInterface {

}

export class NpcDataManager implements NpcDataManagerInterface {

}

interface Callback { (Error, NpcDocument): void }
