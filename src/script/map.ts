import { MapDocument } from '../server/data/maps';

/**
 * Provides an object for scripts to interact with Maps
 *
 * @export
 * @class Map
 */
export class Map {
  constructor(protected gameState: Server.GameState, protected map: MapDocument) {
  }

  get name(): string {
    return this.map.name;
  }

  get playerCount() {
    //TODO
    return null;
  }

  get friendly(): boolean {
    //TODO
    return null;
  }
}
