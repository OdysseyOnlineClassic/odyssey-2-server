import * as net from 'net';
import { Client } from './clients/client';
import { Data } from './data/data';
import { GameState } from './game-state';

export class OdysseyServer {
  private gameState: GameState;
  private server: net.Server;

  constructor(readonly port: number = 5150) {
    this.gameState = new GameState();
    this.server = net.createServer((socket: net.Socket) => { this.onConnection(socket) });
  }

  start() {
    console.log(`Listeneing on ${this.port}`);
    this.gameState.start();
    this.server.listen(this.port);
  }

  protected onConnection(socket: net.Socket) {
    let client = this.gameState.clients.createClient(socket);
  }
}
