import { Player } from './player';

/**
 * Provides an object for scripts to interact with the Game
 *
 * @export
 * @class Game
 */
export class Game {
  constructor(protected gameState) {
  }

  findPlayer(name: string): Player {
    //TODO find the player
    return null;
  }
}
