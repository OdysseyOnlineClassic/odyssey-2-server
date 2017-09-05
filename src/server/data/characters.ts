import * as NeDB from 'nedb';
import * as path from 'path';
import { DataDocument } from './game-data';
import * as Data from './game-data';

/**
 * Represents a Player's Character
 *
 * @export
 * @class CharacterDocument
 * @extends {DataDocument}
 * @extends {Odyssey.Character}
 */
@Data.data
export class CharacterDocument extends DataDocument implements Odyssey.Character {
  @Data.trackProperty(false)
  alive: boolean;

  @Data.trackProperty()
  ammo: number;

  @Data.trackProperty()
  bank: any;

  @Data.trackProperty()
  class: any; //Class interface?

  @Data.trackProperty()
  description?: string;

  @Data.trackProperty()
  equipped: any;

  @Data.trackProperty()
  female: boolean;

  @Data.trackProperty()
  guild: Odyssey.GuildAssociation;

  @Data.trackProperty()
  inventory: any;

  @Data.trackProperty(false)
  location: Odyssey.Location;

  @Data.trackProperty()
  name: string;

  @Data.trackProperty()
  sprite: number;

  @Data.trackProperty()
  status: number;

  @Data.trackProperty()
  stats: Odyssey.Stats;

  @Data.trackProperty(false)
  timers?: {
    walk: number
  }; //Flood, walk, etc.

  @Data.trackProperty()
  accountId: string;

  @Data.trackProperty()
  extended: any; //Extended data to hold whatever scripts want

  protected constructor(protected data, readonly _id, character: Odyssey.Character) {
    super();
    this._id = _id;

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

    this.clearChanges();
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

    // this.data.ensureIndex({
    //   fieldName: '_name',
    //   unique: true,
    //   sparse: false
    // });
  }

  async createCharacter(accountId: string, character: Odyssey.Character): Promise<CharacterDocument> {
    return new Promise<CharacterDocument>((resolve, reject) => {
      let insertCharacter = Object.assign({ _id: character.name.toLowerCase() }, character);
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
    return new Promise<CharacterDocument>((resolve, reject) => {
      if (this.characters[accountId]) {
        return resolve(this.characters[accountId]);
      }

      this.data.findOne({ accountId: accountId }, (err, character: CharacterDocument) => {
        let newCharacter = new ConcreteCharacter(this.data, character._id, character);
        this.characters[accountId] = newCharacter;
        resolve(newCharacter);
      });
    });
  }
}
