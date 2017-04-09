import * as net from 'net';
import { Client } from './client';
import { GameState } from '../game-state';

export class ClientManager {
  private clients: Array<Client>;
  constructor(private game: GameState) {
    this.clients = new Array<Client>(game.options.max.players);
  }

  createClient(socket: net.Socket) {
    let index = this.getAvailablePlayerIndex();

    if (index == null) {
      //TODO Server Full
    }

    let client = new Client(index, socket);
    client.on('message', (message) => { this.game.processMessage(message) })
    this.clients.push(client);

    client.on('disconnect', this.clientDisconnect.bind(this));

    return client;
  }

  sendMessageAll(id: number, data: Buffer, ignoreIndex?: number) {
    for (let i = 0; i < this.clients.length; i++) {
      if (i != ignoreIndex && this.clients[i]) {
        this.clients[i].sendMessage(id, data);
      }
    }
  }

  protected clientDisconnect(client: Client) {
    this.clients[client.index] = null;
  }

  protected getAvailablePlayerIndex() {
    for (let i = 0; i < this.clients.length; i++) {
      if (!this.clients[i]) {
        return i;
      }

      return null;
    }
  }
}
