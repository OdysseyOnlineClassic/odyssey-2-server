import { MessageProcessor } from './process';
import { Message } from '../message';
import { ProcessFunction } from './process';

export class DebugProcessor extends MessageProcessor {
    protected processors: { [id: number]: ProcessFunction } = {};

    constructor(game: Odyssey.GameState) {
        super(game);

        this.processors[100] = this.debug.bind(this);
    }

    async process(msg: Message): Promise<any> {
        this.processors[msg.id](msg);
    }

    debug(msg: Message): void {
        console.debug(`${msg.client.character.name}[${msg.client.getAddress()}] - ${msg.data.toString()}`)
    }
}
