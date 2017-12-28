import * as net from 'net';
import { Client } from './client';
import { GameState } from '../game/game-state';

export enum ClientType {
  Classic,
  WebAdmin
}

export class ClientManager implements Server.Managers.ClientManager {
  public readonly clients: Array<Client>;
  private min = 1;
  constructor(private game: GameState) {
    this.clients = new Array<Client>(game.options.max.players + 1);
  }

  /**
   * Handles client disconnection
   * 
   * @param client 
   */
  disconnect(client) {
    if (this.clients[client.index] !== client) {
      // TODO Error State! Client should not have different index
      let flag = false;
      this.clients.forEach((value, index) => {
        if (value === client) {
          this.clients[index] = null;
          flag = true;
        }
      });

      if (!flag) {
        // TODO Error State! Client was not in list of clients
      }
    } else {
      this.clients[client.index] = null;
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
    for (let i = this.min; i < this.clients.length; i++) {
      if (this.clients[i] && this.clients[i].character && this.clients[i].character.location.map == mapIndex) {
        mapClients.push(this.clients[i]);
      }
    }

    return mapClients;
  }

  /**
   * Registers the client with the game
   * 
   * @param client 
   */
  registerClient(client: Client) {
    let index = this.getAvailablePlayerIndex();
    if (index === null) {
      // TODO Server Full
    }

    client.on('message', (message) => { this.game.processMessage(message); });
    client.on('disconnect', (client) => { this.disconnect(client); })
    client.index = index;
    this.clients[index] = client;

    return index;
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
    for (let i = this.min; i < this.clients.length; i++) {
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
      if (clients[i].index != ignoreIndex) {
        clients[i].sendMessage(id, data);
      }
    }
  }

  protected clientDisconnect(client: Client) {
    this.clients[client.index] = null;
  }

  protected getAvailablePlayerIndex() {
    for (let i = this.min; i < this.clients.length; i++) {
      if (!this.clients[i]) {
        return i;
      }
    }
    return null;
  }
}
