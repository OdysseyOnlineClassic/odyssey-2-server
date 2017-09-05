import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import 'sinon-chai';
import * as fs from 'fs';
import * as path from 'path';

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
    describe('Data Decorator', () => {
      let subject: any;

      before(async () => {
        let ddChar = Object.assign({}, char, { name: 'data-decorator' });
        let character = await data.createCharacter('dd-account', ddChar);
        subject = character as any;
        subject.saveChanges = sinon.spy();
        character.name = 'New Name';
      });

      describe('_changedKeys', () => {
        it('should exist on account', () => {
          expect(subject).to.haveOwnProperty('_changedKeys');
        });

        it('should not be updated on set (name is autosave)', () => {
          expect(subject._changedKeys).to.have.lengthOf(0);
        });
      });

      describe('saveChanges', () => {
        it('should have saveChanges', () => {
          expect(subject.saveChanges).to.be.a('Function');
        })

        it('should call saveChanges', () => {
          expect(subject.saveChanges).to.have.been.calledOnce;
        });
      });

      describe('tracked properties', () => {
        describe('non autosave properties', () => {
          beforeEach('reset spy', () => {
            subject.saveChanges.reset();
          });

          describe('location', () => {
            before(() => {
              subject.location = { map: 2, x: 2, y: 2, direction: 2 };
            });

            it(`shouldn't save location`, () => {
              expect(subject.saveChanges).to.have.been.not.called;
            });

            it(`should mark change`, () => {
              expect(subject._changedKeys).lengthOf(1);
              expect(subject._changedKeys[0]).to.equal('location');
            });

            after(() => {
              subject.clearChanges();
            });
          });
        });

        describe('complex properties', () => {
          beforeEach('reset spy', () => {
            subject.saveChanges.reset();
          });

          it(`should mark change`, () => {
            subject.location.map = 3;
            expect(subject._changedKeys).lengthOf(1);
            expect(subject._changedKeys[0]).to.equal('location');
          });
        });
      });
    });
  });
});
