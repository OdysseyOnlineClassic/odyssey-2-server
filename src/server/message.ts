export class RawMessage {
  protected readonly maxLength: number = 2048;
  messages: { id: number, data: Buffer }[] = [];

  addMessage(id: number, data: Buffer) {
    this.messages.push({ id: id, data: data });
  }

  sendMessage(client: Odyssey.Client) {
    if (this.messages.length == 0) {
      console.error('RawMessage.sendMessage called on empty message array');
      return;
    }

    let concatBuffer: Buffer = Buffer.allocUnsafe(this.maxLength);
    let sendBuffer: Buffer;
    let length = 0;

    for (let i = 0; i < this.messages.length; i++) {

      if (length + 3 + this.messages[i].data.length > this.maxLength) {
        sendBuffer = Buffer.allocUnsafe(length);
        concatBuffer.copy(sendBuffer, 0, 0, length - 1);
        client.sendMessage(170, sendBuffer);
        length = 0;
      }

      this.messages[i].data.copy(concatBuffer, length + 3, 0);
      concatBuffer.writeUInt16BE(this.messages[i].data.length + 1, length);
      concatBuffer.writeUInt8(this.messages[i].id, length + 2);
      length += 3 + this.messages[i].data.length;
    }

    sendBuffer = Buffer.allocUnsafe(length);
    concatBuffer.copy(sendBuffer, 0, 0, length);
    client.sendMessage(170, sendBuffer);
    length = 0;

    this.messages = [];
  }
}

export class Message {
  data: Buffer;
  timestamp: number;

  private bytesRead = 0;

  constructor(public id: number, public length: number, public client: Odyssey.Client) {
    this.data = Buffer.allocUnsafe(length);
    this.timestamp = Date.now();
  }

  append(appendData: Buffer) {
    if (this.bytesRead > this.length) {
      throw new RangeError("Attempting to append to Message beyond its length");
    }
    let bytesLeft = this.length - this.bytesRead;

    //TODO test assumption that if source end (bytesLeft -1) is greater than length, it'll stop at length
    this.bytesRead += appendData.copy(this.data, this.bytesRead, 0, bytesLeft);

    if (this.bytesRead > this.length) {
      throw new RangeError("Too many bytes appended");
    }

    return appendData.slice(bytesLeft);
  }

  isComplete(): boolean {
    return this.bytesRead === this.length;
  }

  send() {
    if (!this.client) {
      throw new TypeError('Client is null. Cannot send to null client');
    }

    this.client.sendMessage(this.id, this.data);
  }
}
