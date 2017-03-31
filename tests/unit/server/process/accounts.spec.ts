import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import * as bcrypt from 'bcrypt';
import { AccountsProcessor } from '../../../../src/server/process/accounts';
import { GameState } from '../../../../src/server/game-state';
import { DataInterface } from '../../../../src/server/data/data';
import { AccountDataManagerInterface } from '../../../../src/server/data/accounts';
import { CharacterDataManagerInterface } from '../../../../src/server/data/characters';
import { Message } from '../../../../src/server/message';
import { ClientInterface } from '../../../../src/server/clients/client';

let accountData: AccountDataManagerInterface = {
  createAccount: sinon.stub(),
  getAccount: sinon.stub()
}

let characterData: CharacterDataManagerInterface = {
  createCharacter: sinon.stub(),
  getCharacter: sinon.stub()
}

let client: ClientInterface = {
  account: null,
  sendMessage: (id, data) => { }
}

let data: DataInterface = {
  getManager(name: string) {
    switch (name) {
      case 'accounts':
        return accountData;
      case 'characters':
        return characterData
    }
  }
}

let game = new GameState(data);
let accountsProcessor = new AccountsProcessor(game)

let sendMessage: sinon.SinonStub = sinon.stub(client, 'sendMessage');

describe('Accounts Processor', () => {
  beforeEach(() => {
    sendMessage.reset();
  })

  describe('Create Account', () => {
    let msgData = 'username\0password';
    let msg = new Message(0, msgData.length, client);
    msg.data = Buffer.from(msgData);

    describe('Error Handling', () => {
      it('should send error when account already exists', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, { errorType: 'uniqueViolated' }, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([1])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send error on database errors', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, { errorType: 'extraneousError' }, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([0, Array.from('\0Unknown Error')])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })

    describe('Failed Checks', () => {
      it('should send error when username is < 3 characters long', () => {
        let badData = 'u\0password';
        let badMsg = new Message(0, badData.length, client);
        badMsg.data = Buffer.from(badData);
        accountsProcessor.process(badMsg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([0, Array.from('Username must be between 3 and 15 characters')])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send error when username is > 15 characters long', () => {
        let badData = 'reallylongusername\0password';
        let badMsg = new Message(0, badData.length, client);
        badMsg.data = Buffer.from(badData);
        accountsProcessor.process(badMsg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([0, Array.from('Username must be between 3 and 15 characters')])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })

    describe('Success', () => {
      it('should send confirmation message', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, null, {});
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(2, Buffer.allocUnsafe(0)), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      });
    })
  })

  describe('Login', () => {
    let msgData = 'username\0password';
    let msg = new Message(1, msgData.length, client);
    msg.data = Buffer.from(msgData);

    let salt = bcrypt.genSaltSync();
    let validPassword = bcrypt.hashSync('password', salt);

    describe('Error Handling', () => {
      it('should send error on accounts database error', () => {
        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, new Error('random db error'), null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(0, Buffer.from('\0Unknown error while loading account')), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send error on characters database error', () => {
        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, null, { username: 'username', password: validPassword });
        characterData.getCharacter = sinon.stub().callsArgOnWith(1, accountsProcessor, {}, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(0, Buffer.from('\0Unknown error while loading character')), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })

    describe('Invalid Login', () => {
      it('should send invalid when username not found', () => {
        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, null, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(0, Buffer.from([1])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send invalid when password is wrong', () => {
        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, null, { username: 'username', password: '' });
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(0, Buffer.from([1])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })

    describe('Successful Login', () => {
      it('should send create character when no character is found', () => {
        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, null, { username: 'username', password: validPassword });
        characterData.getCharacter = sinon.stub().callsArgOnWith(1, accountsProcessor, null, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(3, Buffer.allocUnsafe(0)), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send character data when found', () => {
        let character = {
          name: 'name',
          description: 'description',
          status: 1,
          class: 1,
          female: true,
          sprite: 1000,
          stats: {
            level: 10,
            experience: 1234567
          },
          guild: {
            id: 5,
            rank: 3
          }
        }

        let length = 15 + character.name.length + character.description.length;
        let data = Buffer.allocUnsafe(length);
        data.writeUInt8(character.class, 0);
        data.writeUInt8(character.female ? 0 : 1, 1);
        data.writeUInt16BE(character.sprite, 2);
        data.writeUInt8(character.stats.level, 4);
        data.writeUInt8(character.status, 5);
        data.writeUInt8(character.guild.id, 6);
        data.writeUInt8(character.guild.rank, 7);
        data.writeUInt8(client.account.access, 8);
        data.writeUInt8(0, 9); //TODO player index
        data.writeUInt32BE(character.stats.experience, 10);
        data.write(character.name, 14);
        data.writeUInt8(0, character.name.length + 14);
        data.write(character.description, character.name.length + 15);

        accountData.getAccount = sinon.stub().callsArgOnWith(1, accountsProcessor, null, { username: 'username', password: validPassword });
        characterData.getCharacter = sinon.stub().callsArgOnWith(1, accountsProcessor, null, character);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(3, data), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })
  })
})
