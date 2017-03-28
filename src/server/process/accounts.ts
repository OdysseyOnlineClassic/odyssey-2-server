import * as bcrypt from 'bcrypt';
import * as Q from 'q';
import { GameStateInterface } from '../game-state-interface';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { AccountDataManager } from '../data/accounts';
import { AccountDocument } from '../data/accounts';
import { CharacterDataManager } from '../data/characters';
import { CharacterDocument } from '../data/characters';

export class AccountsProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  private accountData: AccountDataManager;
  private characterData: CharacterDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);
    this.processors[0] = this.createAccount.bind(this);
    this.processors[1] = this.login.bind(this);
    this.processors[2] = this.createAccount.bind(this);

    this.accountData = game.data.getManager('accounts');
    this.characterData = game.data.getManager('characters');
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
      .catch((err) => {
        console.log(err);
      });
  }

  createCharacter(msg: Message) {
    let classIndex: number = msg.data.readUInt8(0);
    let female: boolean = msg.data.readUInt8(1) > 0;
    let dataString: string = msg.data.toString('utf-8', 2);

    let strings = dataString.split('\0');
    let name = strings[0];
    let description = '';
    if (strings.length > 1) {
      description = strings[1];
    }

    let character: CharacterDocument = {
      name: name,
      class: classIndex,
      female: female,
      sprite: 1, //TODO calculate or load sprite
      description: description,
      position: {}, //TODO
      stats: {}, //TODO
      inventory: new Array(20), //TODO
      bank: new Array(20), //TODO
      guild: null,
      extended: null,
      timers: {}, //TODO
      alive: true
    };

    this.characterData.createCharacter(character)
      .then((character) => {
        //Character successfully created
        //Update account to point to character
      })
  }
}
