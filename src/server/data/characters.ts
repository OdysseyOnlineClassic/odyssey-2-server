import * as NeDB from 'nedb';
import * as path from 'path';
import { DataDocument } from './game-data';

/**
 * Represents a Player's Character
 *
 * @export
 * @class CharacterDocument
 * @extends {DataDocument}
 * @extends {Odyssey.Character}
 */
export class CharacterDocument extends DataDocument implements Odyssey.Character {
  accountId: string;
  alive: boolean;
  ammo: number;
  bank: any;
  class: any; //Class interface?
  description?: string;
  equipped: any;
  female: boolean;
  guild: Odyssey.GuildAssociation;
  inventory: any;
  location: Odyssey.Location;
  name: string;
  sprite: number;
  status: number;
  stats: Odyssey.Stats;
  timers?: {
    walk: number
  }; //Flood, walk, etc.
  extended: any; //Extended data to hold whatever scripts want

  protected constructor(protected data, public readonly _id, character: Odyssey.Character) {
    super(data, _id);

    this.alive = character.alive;
    this.ammo = character.ammo;
    this.bank = character.bank;
    this.class = character.class;
    this.description = character.description;
    this.equipped = character.equipped;
    this.female = character.female;
    this.guild = character.guild;
    this.inventory = character.inventory;
    this.location = character.location;
    this.name = character.name;
    this.sprite = character.sprite;
    this.status = character.status;
    this.stats = character.stats;
  }
}

class ConcreteCharacter extends CharacterDocument {
  constructor(data: NeDB, _id, character: Odyssey.Character) {
    super(data, _id, character);
  }
}

interface InventoryItemInterface {
  index: number,
  value: number,
  prefix: number,
  suffix: number
}

export interface CharacterDataManagerInterface {
  createCharacter(accountId: string, character: Odyssey.Character): Promise<CharacterDocument>;
  getCharacter(accountId: string): Promise<CharacterDocument>;
}

export class CharacterDataManager implements CharacterDataManagerInterface {
  private data: NeDB;
  private characters: { [accountId: string]: CharacterDocument } = {};

  constructor(dataFile: string) {
    this.data = new NeDB({
      filename: dataFile,
      autoload: true
    });

    //Keep _id intact as it provides better spread of primary keys
    this.data.ensureIndex({
      fieldName: '_name',
      unique: true,
      sparse: false
    });
  }

  async createCharacter(accountId: string, character: Odyssey.Character): Promise<CharacterDocument> {
    return new Promise<CharacterDocument>((resolve, reject) => {
      let insertCharacter = Object.assign({ _name: character.name.toLowerCase() }, character);
      this.data.insert(insertCharacter, (err, result: any) => {
        if (err) {
          return reject(err);
        }

        let newCharacter = new ConcreteCharacter(this.data, result._id, result);
        this.characters[result.accountId] = newCharacter;

        resolve(newCharacter);
      });
    });
  }

  async getCharacter(accountId: string): Promise<CharacterDocument> {
    let self = this;
    return new Promise<CharacterDocument>((resolve, reject) => {
      if (self.characters[accountId]) {
        return resolve(self.characters[accountId]);
      }

      self.data.findOne({ accountId: accountId }, (err, character: CharacterDocument) => {
        let newCharacter = new ConcreteCharacter(self.data, character._id, character);
        self.characters[accountId] = newCharacter;
        resolve(newCharacter);
      });
    });
  }
}
