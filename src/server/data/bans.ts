import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface BanDocument extends GameDataDocument {

}

export interface BanDataManagerInterface {

}

export class BanDataManager implements BanDataManagerInterface {

}

interface Callback { (Error, BanDocument): void }
