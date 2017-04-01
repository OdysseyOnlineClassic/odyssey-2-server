import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface MapDocument extends GameDataDocument {

}

export interface MapDataManagerInterface {

}

export class MapDataManager implements MapDataManagerInterface {

}

interface Callback { (Error, MapDocument): void }
