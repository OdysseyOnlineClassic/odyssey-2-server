import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MagicDocument extends GameDataDocument {

}

export interface MagicDataManagerInterface {

}

export class MagicDataManager implements MagicDataManagerInterface {

}

interface Callback { (Error, MagicDocument): void }
