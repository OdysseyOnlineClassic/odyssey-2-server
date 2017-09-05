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

  it('returns an AccountDocument', async () => {
    let account = await data.createAccount('test', 'password', 'email');
    expect(account).instanceof(AccountDocument);
  });

  describe('AccountDocument', () => {
    describe('Data Decorator', () => {
      let subject: any; //We use subject because TypeScript doesn't know about decorator properties

      before(async () => {
        let account = await data.createAccount('data-decorator', 'password', 'email');
        subject = account as any;
        subject.saveChanges = sinon.spy();
        account.access = 3;
      });

      describe('_changedKeys', () => {
        it('should exist on account', () => {
          expect(subject).to.haveOwnProperty('_changedKeys');
        });

        it('should not be updated on set (all properties are autosave)', () => {
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
    });

    describe('Auto Save', () => {
      let subject: any; //We use subject because TypeScript doesn't know about decorator properties

      before(async () => {
        let account = await data.createAccount('username', 'password', 'email');
        subject = account as any;
        subject.saveChanges = sinon.spy();
        return;
      });

      beforeEach(() => {
        subject.saveChanges.reset();
      });

      it('should auto save access', () => {
        subject.access = 10;
        expect(subject.saveChanges).to.have.been.calledOnce;
      });

      it('should auto save email', () => {
        subject.email = 'test email';
        expect(subject.saveChanges).to.have.been.calledOnce;
      });

      it('should auto save password', () => {
        subject.password = 'new-password';
        expect(subject.saveChanges).to.have.been.calledOnce;
      });

      it('should auto save username', () => {
        subject.username = 'new-username';
        expect(subject.saveChanges).to.have.been.calledOnce;
      });
    });
  });
})
