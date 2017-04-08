import * as net from 'net';
import * as events from 'events';
import { Message } from '../message';
import { AccountDocument } from '../data/accounts';

export interface ClientInterface {
  account: AccountDocument,
  sendMessage(id: number, data: Buffer);
}

export class Client extends events.EventEmitter implements ClientInterface {
  playing: boolean = false;
  readonly socket: net.Socket;
  private msg: Message = null;
  private packetOrder: number = 0;
  private _account: AccountDocument;

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    socket.on('data', (chunk: Buffer) => { this.onData(chunk); });
    socket.on('end', () => { this.onEnd(); });
  }

  get account() {
    return this._account;
  }

  set account(account: AccountDocument) {
    if (this._account) {
      throw new Error('Client has already been assigned an account.');
    }

    this._account = account
  }

  protected onData(chunk: Buffer) {
    this.readMessage(chunk);
  }

  protected readMessage(data: Buffer) {
    let remainingData: Buffer;

    if (!this.msg) {
      if (data.length < 5) {
        console.log('Need to cache not enough data');
        //Need to cache this data
        return;
      }

      let length = data.readUInt16BE(0) - 1; //We're not including the Packet ID
      let msgId = data.readUInt8(4);
      this.msg = new Message(msgId, length, this);
      remainingData = this.msg.append(data.slice(5));
    }
    else {
      remainingData = this.msg.append(data);
    }

    if (this.msg.isComplete()) {
      this.emit('message', this.msg);
      this.msg = null;
    }

    if (remainingData.length > 0) {
      this.readMessage(remainingData);
    }
  }

  sendMessage(id: number, data: Buffer) {
    let length: number = data.length + 1;
    let buffer: Buffer = Buffer.allocUnsafe(length + 4);
    let checksum: number = id;
    let len = data.length;

    for (let i = 0; i < len; i++) {
      checksum += data.readInt8(i);
    }

    checksum = checksum * 20 % 194;

    //TODO why are we getting range error here?
    //buffer.writeDoubleBE(length, 0);
    buffer.writeUInt8(length >> 8, 0);
    buffer.writeUInt8(length % 256, 1);
    buffer.writeUInt8(checksum, 2);
    buffer.writeUInt8(this.packetOrder, 3);
    buffer.writeUInt8(id, 4);
    data.copy(buffer, 5, 0);

    this.packetOrder++;
    if (this.packetOrder > 200) {
      this.packetOrder = 0;
    }

    this.socket.write(buffer);
  }

  protected onEnd() {
    console.log('end');
  }
}
