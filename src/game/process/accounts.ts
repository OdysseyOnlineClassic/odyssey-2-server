// import { MessageProcessor } from './process';
// import { AccountDataManager } from '../data/accounts';
// import { AccountDocument } from '../data/accounts';
// import { CharacterDataManager } from '../data/characters';
// import AccountManager = Server.Managers.AccountManager;
// import CharacterManager = Server.Managers.CharacterManager;
// import Message = Server.Message;

// export class AccountsProcessor extends MessageProcessor {


//   protected async createCharacter(msg: Message) {
//     let classIndex: number = msg.data.readUInt8(0);
//     let female: boolean = msg.data.readUInt8(1) > 0;
//     let dataString: string = msg.data.toString('utf-8', 2);

//     let strings = dataString.split('\0');
//     let name = strings[0];
//     let description = '';
//     if (strings.length > 1) {
//       description = strings[1];
//     }

//     let character;
//     try {
//       character = await this.characters.createCharacter(msg.client.account._id, name, description, classIndex, female);
//       msg.client.character = character;
//       this.sendCharacter(msg.client, character);
//     } catch (ex) {
//       // 13 tells client name is already in use
//       //TODO how do we handle other possible errors?
//       msg.client.sendMessage(13, Buffer.allocUnsafe(0));
//     }
//   }

// }
