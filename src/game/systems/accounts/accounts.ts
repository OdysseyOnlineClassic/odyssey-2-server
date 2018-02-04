import { Client } from "../../../server/client";
import { Message } from "@odyssey/shared";
import { Enums } from "@odyssey/shared";
import { System } from "../system";
import { AccountData } from './account-data';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

export class Accounts extends System {
  protected data = new AccountData(this.game.config.server.dataFolder + path.sep + this.game.config.game.accounts.file);

  public process(msg: Message, client: Client) {
    switch (msg.id) {
      case 0:
        this.createAccount(msg, client);
        break;
      case 1:
        this.login(msg, client);
        break;
    }
  }

  protected async createAccount(msg: Message, client: Client) {
    const [username, password] = this.splitLogin(msg.data);
    const salt = await bcrypt.genSalt();
    let hashed = await bcrypt.hash(password, salt);

    try {
      await this.data.createAccount(username, hashed);
    } catch (ex) {
      return client.send(Enums.Systems.Account, 1, Buffer.concat([Buffer.from([0]), Buffer.from(ex.message, 'utf8')]));
    }

    return client.sendMessage(new Message(Enums.Systems.Account, 2, 0));
  }

  protected async login(msg: Message, client: Client) {
    const [username, password] = this.splitLogin(msg.data);
    console.log(username);
    const account = await this.data.getAccount(username);
    if (!(account && bcrypt.compare(password, account.password))) {

    }
  }

  protected splitLogin(data: Buffer) {
    return data.toString('utf-8').split('\0');
  }
}
