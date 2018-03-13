import * as NeDB from 'nedb-core';
import * as Data from '../../data/game-data';

export class CharacterData {
  protected data: NeDB;

  constructor(dataFile: string) {
    dataFile = dataFile || 'accounts.data';
    let options: NeDB.DataStoreOptions = {
      filename: dataFile,
      autoload: true
    }
    this.data = new NeDB(options);

    // username is required and cannot be null
    this.data.ensureIndex({
      fieldName: 'accountId',
      unique: true,
      sparse: false
    });
  }

  public async getCharacter(accountId: string): Promise<Character> {
    return new Promise<Character>((resolve, reject) => {
      this.data.findOne({ accountId: accountId }, (err, character) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(Data.applyProxy(new ConcreteCharacter(this.data, character._id, character)));
      });
    });
  }

}

export class Character implements Odyssey.Character {
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
  accountId: string;
  extended: any; //Extended data to hold whatever scripts want

  protected constructor(protected data, public readonly _id, character: Odyssey.Character) {
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

class ConcreteCharacter extends Character {
  constructor(data: NeDB, _id, character: Odyssey.Character) {
    super(data, _id, character);
    //TODO Do we add proxies for object properties here?
  }
}
