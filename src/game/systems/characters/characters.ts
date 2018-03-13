import { Client } from "../../../server/client";
import { Message } from "@odyssey/shared";
import { Enums } from "@odyssey/shared";
import { System } from "../system";

export class Characters extends System {
  public process(msg: Message, client: Client) {

  }

  public serializeCharacter(character) {
    let length = 15 + character.name.length + character.description.length;
    let data = Buffer.allocUnsafe(length);
    data.writeUInt8(character.class, 0);
    data.writeUInt8(character.female ? 0 : 1, 1);
    data.writeUInt16BE(character.sprite, 2);
    data.writeUInt8(character.stats.level, 4);
    data.writeUInt8(character.status, 5);
    data.writeUInt8(character.guild.id, 6);
    data.writeUInt8(character.guild.rank, 7);
    data.writeUInt32BE(character.stats.experience, 8);

    // TODO Stats: MaxHP, MaxEnergy, MaxMana, Attack, Defense, MagicDefense, etc.

    data.write(character.name, 12);
    data.writeUInt8(0, character.name.length + 12);
    data.write(character.description, character.name.length + 13);

    return data;
  }

  public getCharacter(accountId) {

  }
}
