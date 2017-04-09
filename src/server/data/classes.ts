import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

/**
 *
 * Represents the available Character Classes
 *
 * @export
 * @interface CharacterClassDocument
 * @extends {DataDocument}
 */
export interface CharacterClassDocument extends GameDataDocument {
  index: number; //Old code referenced them by index
  maxHP: number;
  maxEnergy: number;
  maxMana: number;
  startHP: number;
  startEnergy: number;
  startMana: number;
}

export class CharacterClassDataManager extends GameDataManager<CharacterClassDocument> {

}
