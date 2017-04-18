import { GameStateInterface } from '../../game-state';
import { MessageProcessor } from '../process';
import { ProcessFunction } from '../process';
import { Message } from '../../message';
import { NpcDataManager } from '../../data/npcs';
import { NpcDocument } from '../../data/npcs';

export class NpcDataProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  protected npcData: NpcDataManager;

  constructor(game: GameStateInterface) {
    super(game);

    this.npcData = game.data.getManager('npcs');

    this.processors[80] = this.sendNpc.bind(this);
  }

  sendNpc(msg: Message) {

  }
}
