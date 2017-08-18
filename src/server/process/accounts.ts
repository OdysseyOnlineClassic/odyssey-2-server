import { MessageProcessor } from './process';
import { AccountDataManager } from '../data/accounts';
import { AccountDocument } from '../data/accounts';
import { CharacterDataManager } from '../data/characters';
import AccountManager = Server.Managers.AccountManager;
import CharacterManager = Server.Managers.CharacterManager;
import Message = Server.Message;

export class AccountsProcessor extends MessageProcessor {
  protected processors: { [id: number]: Server.ProcessFunction } = {};
  private accountData: AccountDataManager;
  private characterData: CharacterDataManager;
  private accounts: Server.Managers.AccountManager;
  private characters: Server.Managers.CharacterManager;

  constructor(protected game: Server.GameState) {
    super(game);
    this.processors[0] = this.createAccount.bind(this);
    this.processors[1] = this.login.bind(this);
    this.processors[2] = this.createCharacter.bind(this);

    this.accountData = game.data.managers.accounts;
    this.characterData = game.data.managers.characters;

    this.accounts = game.managers.accounts;
    this.characters = game.managers.characters;
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  protected async createAccount(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    try {
      await this.accounts.createAccount(username, password);
    } catch (ex) {
      msg.client.sendMessage(1, Buffer.concat([Buffer.from([0]), Buffer.from(ex.message, 'utf8')]));
      return;
    }

    msg.client.sendMessage(2, Buffer.allocUnsafe(0));
  }

  protected async login(msg: Message) {
    let dataString: string = msg.data.toString('utf-8');

    let strings = dataString.split('\0');
    let username = strings[0];
    let password = strings[1];

    let account, character;
    try {
      account = await this.accounts.login(username, password);
      character = await this.characters.getCharacter(account._id);
    } catch (err) {
      msg.client.sendMessage(0, Buffer.concat([Buffer.from([0]), Buffer.from(err)]));
      return;
    }

    msg.client.account = account
    if (!character) {
      msg.client.sendMessage(3, Buffer.allocUnsafe(0));
      return;
    }

    msg.client.character = character;
    this.sendCharacter(msg.client, character);
  }

  protected async createCharacter(msg: Message) {
    let classIndex: number = msg.data.readUInt8(0);
    let female: boolean = msg.data.readUInt8(1) > 0;
    let dataString: string = msg.data.toString('utf-8', 2);

    let strings = dataString.split('\0');
    let name = strings[0];
    let description = '';
    if (strings.length > 1) {
      description = strings[1];
    }

    let character;
    try {
      character = await this.characters.createCharacter(msg.client.account._id, name, description, classIndex, female);
    } catch (ex) {
      throw ex;
    }

    msg.client.character = character;
    this.sendCharacter(msg.client, character);
  }

  protected sendCharacter(client: Server.Client, character: Odyssey.Character): void {
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

    let dataStats = Buffer.allocUnsafe(6);
    dataStats.writeUInt8(client.character.stats.maxHp, 0);
    dataStats.writeUInt8(client.character.stats.maxEnergy, 1);
    dataStats.writeUInt8(client.character.stats.maxMana, 2);
    dataStats.writeUInt8(client.character.stats.attack, 3);
    dataStats.writeUInt8(client.character.stats.defense, 4);
    dataStats.writeUInt8(client.character.stats.magicDefense, 5);
    client.sendMessage(130, dataStats);

    let dataHp = Buffer.allocUnsafe(1);
    dataHp.writeUInt8(client.character.stats.maxHp, 0);
    client.sendMessage(46, dataHp);

    let dataEnergy = Buffer.allocUnsafe(1);
    dataEnergy.writeUInt8(client.character.stats.maxEnergy, 0);
    client.sendMessage(47, dataEnergy);

    let dataMana = Buffer.allocUnsafe(1);
    dataMana.writeUInt8(client.character.stats.maxMana, 0);
    client.sendMessage(48, dataMana);
  }
}
