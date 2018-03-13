// import { MessageProcessor } from './process';
// import { Message } from '../../server/message';


// export class DebugProcessor extends MessageProcessor {
//     protected processors: { [id: number]: Server.ProcessFunction } = {};

//     constructor(game: Server.GameState) {
//         super(game);

//         this.processors[100] = this.debug.bind(this);
//     }

//     async process(msg: Message): Promise<any> {
//         this.processors[msg.id](msg);
//     }

//     debug(msg: Message): void {
//         console.debug(`${msg.client.character.name}[${msg.client.address}] - ${msg.data.toString()}`)
//     }
// }
