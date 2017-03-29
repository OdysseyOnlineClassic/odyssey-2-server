import { expect } from 'chai';
import 'mocha';
import { Message } from '../../../src/server/message';

describe('Message Class', () => {
  describe('Constructor', () => {
    it('should initialize properly', () => {
      let id = 1;
      let length = 2;
      let client = null;
      let msg = new Message(id, length, client);

      expect(msg.id).to.equal(id);
      expect(msg.client).to.equal(client);
      expect(msg.data.length).to.equal(length);
    });
  });

});
