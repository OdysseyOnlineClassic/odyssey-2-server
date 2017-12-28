import { MessageProcessor } from './process';
import { Message } from '../../server/message';

import { GuildDataManager } from '../data/guilds';

export class GuildProcessor extends MessageProcessor {
  protected guildData: GuildDataManager;
  protected processors: { [id: number]: Server.ProcessFunction } = {};

  constructor(game: Server.GameState) {
    super(game);

    this.guildData = game.data.managers.guilds;

    this.processors[6] = this.guildList.bind(this);
    this.processors[24] = this.guildList.bind(this);
  }

  async process(msg: Message): Promise<any> {
    this.processors[msg.id](msg);
  }

  guildList(msg: Message): void {
    let startIndex: number;
    if (msg.data.length == 0) { //msg.id 6
      startIndex = 0;
    } else { //msg.id 24
      startIndex = msg.data.readUInt8(0);
    }

    let data: Buffer[] = [];
    let messageLength = 0;
    let index = startIndex;
    this.guildData.getAll((err, guilds) => {
      for (; index < this.game.options.max.guilds; index++) {
        if (guilds[index]) {
          let length = guilds[index].name.length + 5;
          let guild = Buffer.allocUnsafe(length);
          guild.writeUInt16BE(3 + guilds[index].name.length, 0);
          guild.writeUInt8(70, 2);
          guild.writeUInt8(index, 3);
          guild.writeUInt8(guilds[index].members.length, 4);
          guild.write(guilds[index].name, 5);

          data.push(guild);
          messageLength += length;

          if (messageLength >= 700) {
            break;
          }
        }
      }

      //Tell the client to ask for the next set of guilds, or let us know it's all done
      if (index + 1 < this.game.options.max.guilds) {
        data.push(Buffer.from([0, 3, 35, 24, index]));
      } else {
        data.push(Buffer.from([0, 2, 35, 23]));
      }

      let concatBuffer = Buffer.concat(data);
      msg.client.sendMessage(170, concatBuffer);
    });
  }
}
