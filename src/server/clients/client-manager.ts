import * as net from 'net';
import { Client } from './client';
import { ClassicClient } from './classic/classic-client';
import { GameState } from '../game-state';

export enum ClientType {
  Classic,
  WebAdmin
}

export class ClientManager {
  public clients: Array<Client>;
  constructor(private game: GameState) {
    this.clients = new Array<Client>(game.options.max.players);
  }

  createClient(socket: net.Socket, type: ClientType = ClientType.Classic) {
    let index = this.getAvailablePlayerIndex();

    if (index == null) {
      //TODO Server Full
    }

    switch (type) {
      case ClientType.Classic:
        return this.createClassicClient(index, socket);
    }
  }

  /**
   * Sends a message to all players
   * 
   * @param {number} id 
   * @param {Buffer} data 
   * @param {number} [ignoreIndex] Index of the client to not send to
   * 
   * @memberOf ClientManager
   */
  sendMessageAll(id: number, data: Buffer, ignoreIndex?: number) {
    for (let i = 0; i < this.clients.length; i++) {
      if (i != ignoreIndex && this.clients[i] && this.clients[i].playing) {
        this.clients[i].sendMessage(id, data);
      }
    }
  }

  /**
   * Sends a message to all players on a map
   * 
   * @param {number} id 
   * @param {Buffer} data 
   * @param {number} mapIndex 
   * @param {number} [ignoreIndex] 
   * 
   * @memberOf ClientManager
   */
  sendMessageMap(id: number, data: Buffer, mapIndex: number, ignoreIndex?: number) {
    let clients = this.getClientsByMap(mapIndex);
    for (let i = 0; i < clients.length; i++) {
      clients[i].sendMessage(id, data);
    }
  }

  /**
   * Gets a list of all clients on the map.
   * Index in result is not their global index
   * 
   * @param {number} mapIndex 
   * @returns {Client[]} 
   * 
   * @memberOf ClientManager
   */
  getClientsByMap(mapIndex: number): Client[] {
    let mapClients: Client[] = [];
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i] && this.clients[i].character && this.clients[i].character.location.map == mapIndex) {
        mapClients.push(this.clients[i]);
      }
    }

    return mapClients;
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

  protected createClassicClient(index, socket) {
    let client = new ClassicClient(index, socket);
    client.on('message', (message) => { this.game.processMessage(message) })
    this.clients[index] = client;

    client.on('disconnect', this.clientDisconnect.bind(this));

    return client;
  }
}
