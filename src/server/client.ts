import * as net from 'net';
import * as events from 'events';
import { Message } from './message';
import { AccountDocument } from '../game/data/accounts';
import { CharacterDocument } from '../game/data/characters';

export abstract class Client extends events.EventEmitter implements Server.Client {
  account: AccountDocument;
  readonly address: string;
  character: CharacterDocument;
  index: number; // NOTE it may cause unwanted bugs if we allow this to be set more than once
  playing: boolean;
  abstract sendMessage(id: number, data: Buffer);
}
