import { Client } from "../../../server/client";
import { Message } from "@odyssey/shared";
import { Enums } from "@odyssey/shared";
import { System } from "../system";
import { AccountData } from './account-data';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

enum messages {
  create = 0,
  login = 1,
  logout = 2
}

const success = Buffer.from([0]);

export class Accounts extends System {
  protected data = new AccountData(this.game.config.server.dataFolder + path.sep + this.game.config.game.accounts.file);

  public process(msg: Message, client: Client) {
    switch (msg.id) {
      case messages.create:
        this.createAccount(msg, client);
        break;
      case messages.login:
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
      //TODO Log error
      return client.send(Enums.Systems.Account, messages.create, Buffer.from([255]));
    }

    return client.send(Enums.Systems.Account, messages.create, success);
  }

  protected async login(msg: Message, client: Client) {
    if (client.account) {
      client.send(Enums.Systems.Account, messages.login, Buffer.from([2]));
      //TODO Client already logged in, log an error or hack attempt?
      return;
    }

    const [username, password] = this.splitLogin(msg.data);
    console.log(username);

    let account;

    try {
      account = await this.data.getAccount(username);
    } catch (ex) {
      return client.send(Enums.Systems.Account, messages.login, Buffer.from([255]))
    }

    //Failed login
    if (!(account && bcrypt.compare(password, account.password))) {
      client.send(Enums.Systems.Account, messages.login, Buffer.from([1]))
      return;
    }

    //Successful Login
    client.account = account;

    //TODO Handle characters
  }

  protected async logout(msg: Message, client: Client) {
    client.account = null;
    client.send(Enums.Systems.Account, 2, success)
  }

  protected splitLogin(data: Buffer) {
    return data.toString('utf-8').split('\0');
  }
}
