import * as net from 'net';
import * as events from 'events';
import { Message } from '../message';

export class Client extends events.EventEmitter {
  readonly socket: net.Socket;
  private msg: Message = null;
  private packetOrder: number = 0;

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    socket.on('data', (chunk: Buffer) => { this.onData(chunk); });
    socket.on('end', () => { this.onEnd(); });
  }

  onData(chunk: Buffer) {
    console.log(`Chunk: ${chunk.toString()}\n`);
    this.readMessage(chunk);
  }

  readMessage(data: Buffer) {
    let remainingData: Buffer;

    if (!this.msg) {
      if (data.length < 5) {
        console.log('Need to cache not enough data');
        //Need to cache this data
        return;
      }

      let length = data.readInt16BE(0) - 1; //We're not including the Packet ID
      let msgId = data.readInt8(4);
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

  sendMessage(msg: Message) {
    let length: number = msg.data.length + 1;
    let buffer: Buffer = Buffer.allocUnsafe(length + 4);
    let checksum: number = msg.id;
    let len = msg.data.length;

    for(let i = 0; i < len; i++) {
      checksum += msg.data.readInt8(i);
    }

    checksum = checksum * 20 % 194;

    //TODO why are we getting range error here?
    //buffer.writeDoubleBE(length, 0);
    buffer.writeUInt8(length >> 8, 0);
    buffer.writeUInt8(length % 256, 1);
    buffer.writeInt8(checksum, 2);
    buffer.writeInt8(this.packetOrder, 3);
    buffer.writeInt8(msg.id, 4);
    msg.data.copy(buffer, 5, 0);

    this.packetOrder++;
    if(this.packetOrder > 200) {
      this.packetOrder = 0;
    }

    this.socket.write(buffer);
  }

  onEnd() {
    console.log('end');
  }
}
