import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import 'sinon-chai';
import * as fs from 'fs';
import * as path from 'path';

import { AccountDocument } from '../../../../src/server/data/accounts';
import { AccountDataManager } from '../../../../src/server/data/accounts';

describe('AccountDataManager', () => {
  let dataFile = path.resolve(`${__dirname}/data/accounts.data`);
  let data: AccountDataManager;

  before(async () => {
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

  });
})
