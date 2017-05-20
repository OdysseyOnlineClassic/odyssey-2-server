import * as net from 'net';
import * as events from 'events';
import { Message } from '../message';
import { AccountDocument } from '../data/accounts';
import { CharacterDocument } from '../data/characters';

export interface ClientInterface {
  account: AccountDocument,
  character: CharacterDocument,
  index: number,
  playing: boolean,
  sendMessage(id: number, data: Buffer);
}

export abstract class Client extends events.EventEmitter implements ClientInterface {
  account: AccountDocument;
  character: CharacterDocument;
  index: number;
  playing: boolean;
  abstract sendMessage(id: number, data: Buffer);
}
