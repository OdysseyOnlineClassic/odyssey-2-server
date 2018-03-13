import * as net from 'net';
import * as events from 'events';
import { Enums } from '@odyssey/shared';
import { Message } from '@odyssey/shared';
import { AccountDocument } from '../game/data/accounts';
import { CharacterDocument } from '../game/data/characters';
import { EventEmitter } from 'events';

/**
 * Base client class
 */
export abstract class Client extends EventEmitter {
  public account: AccountDocument;
  public character: CharacterDocument;
  public index: number;
  public playing: boolean = false;
  public readonly address: string;

  public abstract sendMessage(msg: Message);
  public abstract send(system: Enums.Systems, id: number, data: Buffer);
}

/**
 * Clients that communicate over traditional TCP Sockets
 */
export class SocketClient extends Client {
  protected msg: Message;

  constructor(protected socket: net.Socket) {
    super();
    socket.on('data', this.onData.bind(this));
    socket.on('end', this.onEnd.bind(this));
    socket.on('error', this.onError.bind(this));
  }

  get address() {
    return this.socket.address().address;
  }

  public sendMessage(msg: Message) {
    return this.send(msg.system, msg.id, msg.data);
  }

  public send(system, id, data) {
    let length = data.length;
    let buffer = Buffer.allocUnsafe(length + 4);

    buffer.writeUInt16BE(length, 0);
    buffer.writeUInt8(system, 2);
    buffer.writeUInt8(id, 3);
    data.copy(buffer, 4, 0);

    this.socket.write(buffer);
  }

  protected onData(data: Buffer) {
    let remainingData: Buffer;
    console.log('data');

    if (!this.msg) {
      if (data.length < 4) {
        console.log('Need to cache not enough data');
        //Need to cache this data
        return;
      }

      let length = data.readUInt16BE(0); //We're not including the Packet ID
      let system: Enums.Systems = data.readUInt8(2);
      let msgId = data.readUInt8(3);
      this.msg = new Message(system, msgId, length);
      remainingData = this.msg.append(data.slice(4));
    }
    else {
      remainingData = this.msg.append(data);
    }

    if (this.msg.complete) {
      this.emit('message', this.msg);
      this.msg = null;
    }

    if (remainingData.length > 0) {
      this.onData(remainingData);
    }
  }

  protected onEnd() {
    console.log('end');
    this.emit('disconnect', this);
  }

  protected onError(err, address, family, host) {
    console.log(err);
  }
}
