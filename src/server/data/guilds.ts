import * as NeDB from 'nedb';
import { GameDataManager } from './game-data';

export interface GuildDocument extends Server.GameDataDocument {
  name: string,
  members: Membership[],
  declarations: Declaration[],
  hallId: number,
  bank: number,
  sprite: number,
  dueDate: number,
  creationDate: number,
  kills: number,
  deaths: number,
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
