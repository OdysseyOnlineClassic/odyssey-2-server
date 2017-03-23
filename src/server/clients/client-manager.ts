import * as net from 'net';
import {Client} from './client';
import {GameState} from '../game-state';

export class ClientManager {
  private clients: Array<Client>;
  constructor(private game: GameState) {
    this.clients = new Array<Client>(200);
  }

  createClient(socket: net.Socket) {
    let client = new Client(socket);
    client.on('message', (message) => {this.game.processMessage(message)})
    this.clients.push(client);
    return client;
  }
}
