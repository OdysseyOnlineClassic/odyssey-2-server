import * as net from 'net';
import {ClientManager} from './clients/ClientManager';
import {Client} from './clients/client';

export class OdysseyServer {
  readonly port;
  private server: net.Server;
  private clients: clients.ClientManager;

  constructor(port: number = 5150) {
    this.clients = new clients.ClientManager();
    this.port = port;
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
