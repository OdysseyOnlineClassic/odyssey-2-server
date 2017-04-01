import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface SuffixDocument extends GameDataDocument {

}

export interface SuffixDataManagerInterface {

}

export class SuffixDataManager implements SuffixDataManagerInterface {

}

interface Callback { (Error, SuffixDocument): void }
