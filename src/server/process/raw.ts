import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';
import { ObjectDataManager } from '../data/objects';

export class RawProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected objectData: ObjectDataManager;

  constructor(protected game: GameStateInterface) {
    super(game);
  }

  async process(msg: Message): Promise<any> {
    const headerOffset: number = 3;
    let offset: number = 0;
    let length: number;
    let msgId: number;
    let data: Buffer;

    let extractedMsg: Message;

    /**
     * [A, A, B, C ...]
     * AA UInt16BE Length
     * B UInt8 MsgId
     * C ... Data
     */
    while (offset < msg.data.length - headerOffset) {
      length = msg.data.readUInt16BE(offset) - 1;
      msgId = msg.data.readUInt8(offset + 2);
      extractedMsg = new Message(msgId, length, msg.client);

      msg.data.copy(extractedMsg.data, 0, offset + headerOffset, offset + headerOffset + length);

      this.game.processMessage(extractedMsg);

      offset += length + headerOffset;
    }
  }
}
