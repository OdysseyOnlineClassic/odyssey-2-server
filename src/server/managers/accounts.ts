import * as bcrypt from 'bcryptjs';

export class AccountManager {
    private accountData;
    private characterData;

    constructor(private gameState: Odyssey.GameState) {
        this.accountData = gameState.data.getManager('accounts');
        this.characterData = gameState.data.getManager('characters');
    }

    public createAccount(username: string, password: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (username.length < 3 || username.length > 15) {
                throw new RangeError('Username must be between 3 and 15 characters');
            }

            if (password.length < 8) {
                throw new RangeError('Password must be at least 8 characters');
            }

            let salt = bcrypt.genSaltSync();
            password = bcrypt.hashSync(password, salt);

            this.accountData.createAccount(username, password, (err, account) => {
                if (err) {
                    if (err.errorType == 'uniqueViolated') {
                        //Account already exists
                        throw new Error('That user name is already in use.  Please try another.');
                    } else {
                        //Database Error
                        throw new Error('Unknown Error');
                    }
                }
            });

            resolve();
        })
    }

    public login(username, password) {
        return new Promise((resolve, reject) => {
            this.accountData.getAccount(username, (err, account) => {
                if (err) {
                    throw new Error('Unknown Error');
                }

                if (!(account && bcrypt.compareSync(password, account.password))) {
                    //Invalid user/pass
                    throw new Error('Invalid user name/password!');
                }

                //TODO Check if already logged in
                //TODO Check for Ban

                resolve(account);
            });
        })
    }

    public updateAccess(account, access: number) {

    }
}
