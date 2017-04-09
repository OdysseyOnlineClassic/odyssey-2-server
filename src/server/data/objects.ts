import { GameDataDocument } from './data';
import { GameDataManager } from './data';

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
