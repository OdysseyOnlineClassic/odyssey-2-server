import { MessageProcessor } from './process';
import { Message } from '../message';

export class AccountsProcessor extends MessageProcessor {
  process(msg: Message): void {
    let dataString: string = msg.data.toString('utf-8');
    let nullIndex: number = dataString.indexOf('\0');

    let username = dataString.substr(0, nullIndex);
    let password = dataString.substr(nullIndex + 1);

    console.log(`New Account ${username}:${password}`);

    this.game.data.getManager('accounts').createAccount(username, password);

    msg.client.sendMessage(new Message(2, 0, msg.client))
  }
}
