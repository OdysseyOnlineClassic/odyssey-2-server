import { GameStateInterface } from '../game-state';
import { MessageProcessor } from './process';
import { ProcessFunction } from './process';
import { Message } from '../message';

export class ClientProcessor extends MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};

  constructor(game: GameStateInterface) {
    super(game);

    this.processors[23] = this.joinGame.bind(this);
    this.processors[61] = this.clientInfo.bind(this);
  }

  process(msg: Message): void {
    this.processors[msg.id](msg);
  }

  clientInfo(msg: Message) {

  }

  joinGame(msg: Message) {
    msg.client.playing = true;
    this.game.clients.sendMessageAll(6, this.serializeJoinCharacter(msg.client.index, msg.client.character), msg.client.index);

    msg.client.sendMessage(24, Buffer.from([]));

    let data: Buffer[] = [];

    for (let i = 0; i < this.game.clients.clients.length; i++) {
      if (this.game.clients.clients[i] && this.game.clients.clients[i].playing) {
        if (i === msg.client.index) {
          continue;
        }
        data.push(this.serializeJoinCharacter(i, this.game.clients.clients[i].character));
      }
    }

    //Compile inventory data

    //Compile equipped data

    msg.client.sendMessage(143, Buffer.from([0])); //TODO this pins outdoor light to 0

    this.game.events.player.joinMap(msg.client, msg.client.character.location);
  }

  protected serializeJoinCharacter(index, character) {
    let joinChar = Buffer.allocUnsafe(6 + character.name.length);
    joinChar.writeUInt8(index, 0);
    joinChar.writeUInt16BE(character.sprite, 1);
    joinChar.writeUInt8(character.status, 3);
    joinChar.writeUInt8(character.guild.id, 4);
    joinChar.writeUInt8(character.stats.maxHp, 5);
    joinChar.write(character.name, 6);

    return joinChar;
  }
}
