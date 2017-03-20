import * as net from 'net';
import {Client} from './client';

export class ClientManager {
  private clients: Array<Client>;
  constructor() {
    this.clients = new Array<Client>(200);
  }

  createClient(socket: net.Socket) {
    let client = new Client(socket);
    this.clients.push(client);
    return client;
  }
}
