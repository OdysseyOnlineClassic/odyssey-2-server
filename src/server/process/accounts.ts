import * as bcrypt from 'bcrypt';
import * as Q from 'q';
import { GameStateInterface } from '../game-state-interface';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { AccountDataManager } from '../data/accounts';
import { AccountDocument } from '../data/accounts';

export class AccountsProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  private accountData: AccountDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);
    this.processors[0] = this.createAccount.bind(this);
    this.processors[1] = this.login.bind(this);

    this.accountData = game.data.getManager('accounts');
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  createAccount(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    let salt = bcrypt.genSaltSync();
    password = bcrypt.hashSync(password, salt);

    this.accountData.createAccount(username, password)
      .then((account) => {
        //Successfully created
        msg.client.sendMessage(2, Buffer.allocUnsafe(0));
      })
      .catch((err) => {
        if (err.errorType == 'uniqueViolated') {
          //Account already exists
          msg.client.sendMessage(1, Buffer.from([1]));
        }
      });
  }

  login(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    let self = this;
    this.accountData.getAccount(username)
      .then((account: AccountDocument) => {
        if (!(account && bcrypt.compareSync(password, account.password))) {
          msg.client.sendMessage(0, Buffer.from([1]));
          return;
        }

        /*self.characterData.getCharacter(account._id)
          .then((character) => {
            if(!character) {
              msg.client.sendMessage(3, Buffer.allocUnsafe(0));
            }
          })*/
      })
      .then((authenticated) => {
        if(!authenticated) {
          msg.client.sendMessage(0, Buffer.from([1]));
          return;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
