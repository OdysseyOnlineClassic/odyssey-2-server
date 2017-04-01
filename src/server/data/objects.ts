import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface ObjectDocument extends GameDataDocument {

}

export interface ObjectDataManagerInterface {

}

export class ObjectDataManager implements ObjectDataManagerInterface {

}

interface Callback { (Error, ObjectDocument): void }
