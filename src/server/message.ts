import {Client} from './clients/client';

export class Message {
  data: Buffer;

  private bytesRead = 0;

  constructor(public id: number, public length: number, public client: Client) {
    this.id = id;
    this.length = length;
    this.client = client;

    this.data = Buffer.allocUnsafe(length);
  }

  append(appendData: Buffer) {
    if(this.bytesRead >= this.length) {
      throw new RangeError("Attempting to append to Message beyond its length");
    }
    let bytesLeft = this.length - this.bytesRead;

    //TODO test assumption that if source end (bytesLeft -1) is greater than length, it'll stop at length
    this.bytesRead += appendData.copy(this.data, this.bytesRead, 0, bytesLeft);

    if(this.bytesRead > this.length) {
      throw new RangeError("Too many bytes appended");
    }

    return appendData.slice(bytesLeft);
  }

  isComplete():boolean {
    return this.bytesRead === this.length;
  }
}
