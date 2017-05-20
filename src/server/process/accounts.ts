import * as bcrypt from 'bcrypt';
import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { AccountDataManager } from '../data/accounts';
import { AccountDocument } from '../data/accounts';
import { CharacterDataManager } from '../data/characters';
import { CharacterDocument } from '../data/characters';
import { ClientInterface } from '../clients/client';

export class AccountsProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  private accountData: AccountDataManager;
  private characterData: CharacterDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);
    this.processors[0] = this.createAccount.bind(this);
    this.processors[1] = this.login.bind(this);
    this.processors[2] = this.createCharacter.bind(this);

    this.accountData = game.data.getManager('accounts');
    this.characterData = game.data.getManager('characters');
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  createAccount(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    if (username.length < 3 || username.length > 15) {
      msg.client.sendMessage(1, Buffer.from([0, Array.from('Username must be between 3 and 15 characters')]));
      return;
    }

    if (password.length < 8) {
      msg.client.sendMessage(1, Buffer.from([0, Array.from('Password must be at least 8 characters')]));
      return;
    }

    let salt = bcrypt.genSaltSync();
    password = bcrypt.hashSync(password, salt);

    this.accountData.createAccount(username, password, (err, account) => {
      if (err) {
        if (err.errorType == 'uniqueViolated') {
          //Account already exists
          msg.client.sendMessage(1, Buffer.from([1]));
        } else {
          //Database Error
          msg.client.sendMessage(1, Buffer.from([0, Array.from('\0Unknown Error')]));
        }
        return;
      }

      msg.client.sendMessage(2, Buffer.allocUnsafe(0));
    });
  }

  login(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    this.accountData.getAccount(username, (err, account) => {
      if (err) {
        msg.client.sendMessage(0, Buffer.from('\0Unknown error while loading account'));
        return;
      }

      if (!(account && bcrypt.compareSync(password, account.password))) {
        //Invalid user/pass
        msg.client.sendMessage(0, Buffer.from([1]));
        return;
      }

      //TODO Check if already logged in

      //TODO Check for Ban

      msg.client.account = account;

      this.characterData.getCharacter(account._id, (err, character) => {
        if (err) {
          msg.client.sendMessage(0, Buffer.from('\0Unknown error while loading character'))
          return;
        }

        if (!character) {
          msg.client.sendMessage(3, Buffer.allocUnsafe(0));
          return;
        }

        if (!character.location) {
          //TODO define start location
          character.location = {
            map: 1,
            x: 0,
            y: 0,
            direction: 0
          }
        }
        msg.client.character = character;
        this.sendCharacter(msg.client, character);
      });
    });
  }

  protected createCharacter(msg: Message) {
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
      accountId: msg.client.account._id,
      name: name,
      class: classIndex,
      female: female,
      sprite: 1, //TODO calculate or load sprite
      description: description,
      status: 1,
      location: { //TODO define start location
        map: 1,
        x: 0,
        y: 0,
        direction: 0
      },
      stats: {
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
      extended: null,
      timers: {
        walk: 0
      }, //TODO
      alive: true
    };

    this.characterData.createCharacter(character, (err, character) => {
      msg.client.character = character;
      this.sendCharacter(msg.client, character);
    });
  }

  protected sendCharacter(client: ClientInterface, character: CharacterDocument): void {
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

    client.sendMessage(3, data);
  }
}
