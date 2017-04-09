import * as NeDB from 'nedb';
import { GameDataDocument } from './data';
import { GameDataManager } from './data';

export interface GuildDocument extends GameDataDocument {
  name: string,
  members: Membership[],
  declarations: Declaration[],
  hallId: number,
  bank: number,
  sprite: number,
  dueDate: number,
  creationDate: number,
  kills: number, //Possible to aggregate from membership?
  deaths: number, //Possible to aggregate from membership?
  motd: string,
  motdDate: number,
  motdCreatorId: string,
  updateFlag: boolean
}

interface Declaration {
  guildId: string,
  type: number,
  date: number,
  kills: number,
  deaths: number
}

interface Membership {
  id: string,
  rank: number,
  joinDate: number,
  kills: number,
  deaths: number
}

export interface GuildDataManagerInterface {

}

export class GuildDataManager extends GameDataManager<GuildDocument>{
}
