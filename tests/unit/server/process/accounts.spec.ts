import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

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
    let msg = new Message(0, 3, client);
    msg.data = Buffer.from([80, 0, 80]); // 'P\0P'

    describe('Handles Errors', () => {
      it('should send error when account already exists', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, null, { errorType: 'uniqueViolated' });
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([1])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })

      it('should send error for other database errors', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, null, { errorType: 'extraneousError' });
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(1, Buffer.from([0, Array.from('Unknown Error')])), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      })
    })

    describe('Responds to Successful Creation', () => {
      it('should send confirmation message', () => {
        accountData.createAccount = sinon.stub().callsArgOnWith(2, accountsProcessor, {}, null);
        accountsProcessor.process(msg);

        assert.isTrue(sendMessage.calledOnce, `client.sendMessage was called ${sendMessage.callCount} times`);
        assert.isTrue(sendMessage.calledWith(2, Buffer.allocUnsafe(0)), `client.sendMessage was called with ${sendMessage.lastCall.args}`);
      });
    })
  })
})
