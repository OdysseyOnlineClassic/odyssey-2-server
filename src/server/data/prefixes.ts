import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface PrefixDocument extends GameDataDocument {

}

export interface PrefixDataManagerInterface {

}

export class PrefixDataManager implements PrefixDataManagerInterface {

}

interface Callback { (Error, PrefixDocument): void }
