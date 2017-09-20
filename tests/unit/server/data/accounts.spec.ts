import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as fs from 'fs';
import * as path from 'path';

chai.use(sinonChai);
const expect = chai.expect;

import { AccountDocument } from '../../../../src/server/data/accounts';
import { AccountDataManager } from '../../../../src/server/data/accounts';

describe('AccountDataManager', () => {
  let dataFile = path.resolve(`${__dirname}/data/accounts.data`);
  let data: AccountDataManager;

  before(() => {
    if (fs.existsSync(dataFile)) {
      fs.unlinkSync(dataFile);
    }
    data = new AccountDataManager(dataFile);
  });

  it('should return an AccountDocument', async () => {
    let account = await data.createAccount('test', 'password', 'email');
    expect(account).instanceof(AccountDocument);
  });

  describe('AccountDocument', () => {
    describe('Auto Save', () => {
      let subject;

      before(async () => {
        subject = await data.createAccount('username', 'password', 'email');
        sinon.spy(subject, 'saveChange');
        return;
      });

      beforeEach(() => {
        subject.saveChange.reset();
      });

      it('should auto save all non-function properties', () => {
        const keys = Object.keys(subject);
        keys.forEach((key) => {
          if (key === 'data' || key === '_id') {
            return;
          }

          subject.saveChange.reset();
          if (!(subject[key] instanceof Function)) {
            subject[key] = 'new value';
            expect(subject.saveChange).to.have.been.calledOnce;
            expect(subject.saveChange).to.have.been.calledWith(key);
          }
        });
      });
    });
  });
})
