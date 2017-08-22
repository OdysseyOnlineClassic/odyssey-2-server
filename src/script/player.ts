/**
 * Provides an object for scripts to interact with the subject player
 *
 * @export
 * @class Player
 */
export class Player {
  constructor(protected gameState: Server.GameState, protected client: Server.Client) {
  }

  get access() {
    return this.client.account.access;
  }

  get location() {
    return this.client.character.location;
  }

  set location(location: Odyssey.Location) {
    this.gameState.managers.player.warp(this.client, location);
  }
}
