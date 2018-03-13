// import { MessageProcessor } from '../process';

// import { Message } from '../../../server/message';
// import { NpcDataManager } from '../../data/npcs';
// import { NpcDocument } from '../../data/npcs';

// export class NpcDataProcessor extends MessageProcessor {
//   protected processors: { [id: number]: Server.ProcessFunction } = {};

//   protected npcData: NpcDataManager;

//   constructor(game: Server.GameState) {
//     super(game);

//     this.npcData = game.data.managers.npcs;

//     this.processors[80] = this.sendNpc.bind(this);
//   }

//   sendNpc(msg: Message) {

//   }
// }
