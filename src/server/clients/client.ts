import * as net from 'net';
import * as events from 'events';
import {Message} from './message';

export class Client extends events.EventEmitter {
  readonly socket: net.Socket;
  private msg: Message = null;

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    socket.on('data', (chunk: Buffer) => {this.onData(chunk);});
    socket.on('end', () => {this.onEnd();});
  }

  onData(chunk: Buffer) {
    console.log(`Chunk: ${chunk.toString()}\n`);
    this.readMessage(chunk);
  }

  readMessage(data: Buffer) {
    let remainingData: Buffer;

    if(!this.msg) {
      if(data.length < 5) {
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

    if(this.msg.isComplete()){
      this.emit('message', this.msg);
      this.msg = null;
    }

    if(remainingData.length > 0) {
      this.readMessage(remainingData);
    }
  }

  onEnd() {
    console.log('end');
  }
}
