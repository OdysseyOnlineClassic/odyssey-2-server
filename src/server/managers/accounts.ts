import * as bcrypt from 'bcryptjs';

export class AccountManager implements Server.Managers.AccountManager {
  private accountData;
  private characterData;

  constructor(private gameState: Server.GameState) {
    this.accountData = gameState.data.managers.accounts;
    this.characterData = gameState.data.managers.characters;
  }

  public async createAccount(username: string, password: string): Promise<Odyssey.Account> {
    if (username.length < 3 || username.length > 15) {
      throw new RangeError('Username must be between 3 and 15 characters');
    }

    if (password.length < 8) {
      throw new RangeError('Password must be at least 8 characters');
    }

    let salt = bcrypt.genSaltSync();
    password = bcrypt.hashSync(password, salt);

    try {
      let account = await this.accountData.createAccount(username, password);
      return account;
    } catch (err) {
      if (err.errorType == 'uniqueViolated') {
        //Account already exists
        throw new Error('That user name is already in use.  Please try another.');
      } else {
        //Database Error
        throw new Error('Unknown Error');
      }
    }
  }

  public async login(username: string, password: string): Promise<Odyssey.Account> {
    let account = await this.accountData.getAccount(username);
    if (!(account && bcrypt.compareSync(password, account.password))) {
      //Invalid user/pass
      throw 'Invalid user name/password!';
    }

    return account;
  }
}
