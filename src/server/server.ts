import * as net from 'net';
import { Client } from './clients/client';
import { Data } from './data/data';
import { GameState } from './game-state';

export class OdysseyServer {
  private server: net.Server;

  constructor(private gameState: GameState, readonly port: number = 5150) {
    this.server = net.createServer((socket: net.Socket) => { this.onConnection(socket) });
  }

  start() {
    console.log(`Listeneing on ${this.port}`);
    this.gameState.start();
    this.server.listen(this.port);
  }

  protected onConnection(socket: net.Socket) {
    console.log(socket.remoteAddress);
    console.log(socket.remotePort);
    let client = this.gameState.clients.createClient(socket);
  }
}
