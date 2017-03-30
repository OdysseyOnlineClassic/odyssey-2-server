import * as NeDB from 'nedb';
import * as Q from 'q';
import * as path from 'path';
import { DataDocument } from './data';

/**
 * Represents a Player's Character
 *
 * @export
 * @interface CharacterDocument
 * @extends {DataDocument}
 */
export interface CharacterDocument extends DataDocument {
  accountId: string;
  name: string;
  class: any; //Class interface?
  female: boolean;
  sprite: number;
  description?: string;
  status: number;
  position: any; //Position interface
  stats: any; //Stats interface
  inventory: any; //Inventory interface
  bank: any; //Bank interface (extends inventory?)
  guild: CharacterGuild; //Guild Interface
  extended: any; //Extended data to hold whatever scripts want
  timers: any; //Flood, walk, etc.
  alive: boolean;

  /*'Character Data
  Name As String
  Class As Byte
  Gender As Byte
  Sprite As Integer
  desc As String

  'Position Data
  Map As Integer
  X As Byte
  Y As Byte
  D As Byte

  'Vital Stat Data
  MaxHP As Integer
  MaxEnergy As Integer
  MaxMana As Integer
  HP As Integer
  Energy As Integer
  Mana As Integer

  PacketOrder As Integer
  ServerPacketOrder As Integer

  'Physical Stat Data
  Level As Byte
  Experience As Long

  'Misc. Data
  Status As Integer
  Bank As Long
  TimeLeft As Currency

  ScriptTimer(1 To MaxPlayerTimers) As Long
  Script(1 To MaxPlayerTimers) As String

  ItemBank(0 To 29) As ItemBankData
  Skill(1 To 10) As SkillData
  MagicLevel(1 To MaxMagic) As SkillData

  'Guild Data
  Guild As Byte
  GuildRank As Byte
  GuildSlot As Byte
  JoinRequest As Byte

  'Inventory Data
  Inv(1 To 20) As InvObject
  EquippedObject(1 To 6) As EquippedObjectData
  ProjectileDamage(1 To 20) As ProjectileDamageData

  'Flag Data
  Flag(0 To MaxPlayerFlags) As Long

  FloodTimer As Currency
  CastTimer As Currency

  WalkTimer As Currency
  WalkCount As Currency
  ShootTimer As Currency
  AttackTimer As Currency
  SpeedHackTimer As Currency

  IsDead As Boolean
  DeadTick As Currency
  SpeedTick As Currency
  LastSkillUse As Currency

  'Target Data
  CurrentRepairTar As Integer

  SpeedStrikes As Long

  'Database Data
  Bookmark As Variant*/
}

/**
 *
 * Represents the available Character Classes
 *
 * @export
 * @interface CharacterClassDocument
 * @extends {DataDocument}
 */
export interface CharacterClassDocument extends DataDocument {
  index: number; //Old code referenced them by index
  maxHP: number;
  maxEnergy: number;
  maxMana: number;
  startHP: number;
  startEnergy: number;
  startMana: number;
}

export interface CharacterDataManagerInterface {
  createCharacter(character: CharacterDocument, cb: Callback): void,
  getCharacter(accountId: string, cb: Callback)
}

export class CharacterDataManager {
  private characterData: NeDB;
  private classData: NeDB;

  constructor(dataFolder: string) {
    this.characterData = new NeDB({
      filename: dataFolder + path.sep + 'characters.data',
      autoload: true
    });

    this.characterData.ensureIndex({
      fieldName: '_name',
      unique: true,
      sparse: false
    });

    this.classData = new NeDB({
      filename: dataFolder + path.sep + 'classes.data',
      autoload: true
    });

    this.classData.ensureIndex({
      fieldName: 'index',
      unique: true,
      sparse: false
    });
  }

  createCharacter(character: CharacterDocument, cb: Callback): void {
    this.characterData.insert(character, cb);
  }

  getCharacter(accountId: string, cb: Callback) {
    this.characterData.findOne({accountId: accountId}, cb);
  }

}

interface Callback { (Error, CharacterDocument): void }

interface CharacterGuild {
  id: number, //Guild numeric id, old system used byte (255)
  rank: number,
  slot: number, //TODO what is this for in old code?
  invite: number //Current invite to join Guild by number id
}
