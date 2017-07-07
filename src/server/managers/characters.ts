import { CharacterDocument } from '../data/characters';

export class CharacterManager {
  private characterData;

  constructor(private game: Odyssey.GameState) {
    this.characterData = game.data.managers.characters;
  }

  public createCharacter(accountId, name, description, classIndex, female) {
    return new Promise((resolve, reject) => {
      let character: CharacterDocument = {
        _id: name.toLowerCast(),
        accountId: accountId,
        name: name,
        class: classIndex,
        female: female,
        sprite: 1, //TODO calculate or load sprite
        description: description,
        status: 1,
        location: { //TODO define start location
          map: 1,
          x: 0,
          y: 0,
          direction: 0
        },
        stats: {
          attack: 1,
          defense: 1,
          magicDefense: 1,
          maxHp: 10,
          maxEnergy: 10,
          maxMana: 10,
          level: 1,
          experience: 0
        }, //TODO
        inventory: new Array(20), //TODO
        equipped: new Array(5),
        ammo: null,
        bank: new Array(20), //TODO
        guild: {
          id: null,
          rank: 0,
          slot: 0,
          invite: 0
        },
        extended: null,
        timers: {
          walk: 0
        }, //TODO
        alive: true
      };

      this.characterData.createCharacter(character, (err, character) => {
        if (err) {
          throw err;
        }

        resolve(character);
      });
    });
  }

  public getCharacter(accountId) {
    return new Promise((resolve, reject) => {
      this.characterData.getCharacter(accountId, (err, character) => {
        if (err) {
          throw new Error('Unknown error while loading character');
        }

        if (character && !character.location) {
          //TODO define start location
          character.location = {
            map: 1,
            x: 0,
            y: 0,
            direction: 0
          }
        }

        resolve(character);
      });
    });
  }
}
