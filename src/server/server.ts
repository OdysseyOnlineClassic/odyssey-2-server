import * as net from 'net';
import {ClientManager} from './clients/client-manager';
import {Client} from './clients/client';
import {Data} from './data/data';
import {GameState} from './game-state';

export class OdysseyServer {
  private data: Data;
  private gameState: GameState;
  private server: net.Server;
  private clients: ClientManager;

  constructor(readonly port: number = 5150) {
    this.data = new Data('server.dat', {});
    this.gameState = new GameState(this.data);
    this.clients = new ClientManager(this.gameState);
    this.server = net.createServer((socket: net.Socket) => {this.onConnection(socket)});
  }

  start() {
    console.log(`Listeneing on ${this.port}`);
    this.server.listen(this.port);
  }

  protected onConnection(socket: net.Socket){
    let client = this.clients.createClient(socket);
  }
}
