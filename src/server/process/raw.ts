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

  process(msg: Message): void {

  }
}
