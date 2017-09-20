import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as fs from 'fs';
import * as path from 'path';

chai.use(sinonChai);
const expect = chai.expect;

import { CharacterDocument } from '../../../../src/server/data/characters';
import { CharacterDataManager } from '../../../../src/server/data/characters';

describe('CharacterDataManager', () => {
  let dataFile = path.resolve(`${__dirname}/data/characters.data`);
  let data: CharacterDataManager;

  let char = {
    name: 'name',
    class: 1,
    female: true,
    sprite: 1, //TODO calculate or load sprite
    description: 'description',
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
    timers: {
      walk: 0
    }, //TODO
    alive: true
  };

  before(async () => {
    if (fs.existsSync(dataFile)) {
      fs.unlinkSync(dataFile);
    }
    data = new CharacterDataManager(dataFile);
  });

  it('should return a CharacterDocument', async () => {
    let character = await data.createCharacter('accountid', char);
    expect(character).instanceof(CharacterDocument);
  });

  describe('CharacterDocument', () => {
  });
});
