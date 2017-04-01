import * as NeDB from 'nedb';
import * as path from 'path';
import { GameDataDocument } from './data';

export interface GuildDocument extends GameDataDocument {

}

export interface GuildDataManagerInterface {

}

export class GuildDataManager implements GuildDataManagerInterface {

}

interface Callback { (Error, GuildDocument): void }
