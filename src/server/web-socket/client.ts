import * as Socket from 'ws';
import { Client } from "../client";
import { Message, Enums } from "@odyssey/shared";

export class WSClient extends Client {
    protected msg: Message;

    constructor(protected socket: Socket) {
        super();
        this.socket.on('message', this.onMessage.bind(this));
        // TODO end and error
    }

    public send(system: Enums.Systems, id: number, data: Buffer) {
        let length = data.length;
        let buffer = Buffer.allocUnsafe(length + 4);

        buffer.writeUInt16BE(length, 0);
        buffer.writeUInt8(system, 2);
        buffer.writeUInt8(id, 3);
        data.copy(buffer, 4, 0);

        this.socket.send(buffer);
    }

    protected onMessage(data: Buffer) {
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
            this.onMessage(remainingData);
        }
    }
}