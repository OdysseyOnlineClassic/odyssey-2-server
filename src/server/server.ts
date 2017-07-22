import * as net from 'net';
import { Client } from './clients/client';
import { Data } from './data/data';
import { GameState } from './game-state';

export class OdysseyServer {
  private server: net.Server;

  constructor(private gameState: GameState, private readonly config: Odyssey.Config) {
    this.server = net.createServer((socket: net.Socket) => { this.onConnection(socket) });
    this.start();
  }

  start() {
    console.log(`Listeneing on ${this.config.server.port}`);
    this.server.listen(this.config.server.port);
  }

  protected onConnection(socket: net.Socket) {
    console.log(socket.remoteAddress);
    console.log(socket.remotePort);
    let client = this.gameState.clients.createClient(socket);
  }
}
