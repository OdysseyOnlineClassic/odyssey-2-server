import { GameDataDocument } from './game-data';
import { GameDataManager } from './game-data';

export interface ObjectDocument extends GameDataDocument {
  name: string,
  sprite: number,
  type: number,
  data: [number],
  flags: number,
  class: number,
  level: number,
  sellPrice: number
}

export class ObjectDataManager extends GameDataManager<ObjectDocument> {
}
