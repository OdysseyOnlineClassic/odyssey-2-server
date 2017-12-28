import * as net from 'net';
import { ClassicClient } from './classic-client';
import { GameState } from '../../game/game-state';

export class ClassicServer {
  private server: net.Server;

  constructor(private gameState: GameState) {
    this.server = net.createServer((socket: net.Socket) => { this.onConnection(socket) });
    this.start();
  }

  start() {
    console.log(`Listeneing on ${this.gameState.config.server.port}`);
    this.server.listen(this.gameState.config.server.port);
  }

  protected onConnection(socket: net.Socket) {
    console.log(socket.remoteAddress);
    console.log(socket.remotePort);
    let client = new ClassicClient(socket);
    this.gameState.clients.registerClient(client);
  }
}
