import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface HallDocument extends GameDataDocument {

}

export interface HallDataManagerInterface {

}

export class HallDataManager implements HallDataManagerInterface {

}

interface Callback { (Error, HallDocument): void }
