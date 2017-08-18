export class Player {
  constructor(protected gameState: Odyssey.GameState, protected client: Odyssey.Client) {
  }

  get access() {
    return this.client.account.access;
  }

  get location() {
    return this.client.character.location;
  }

  warp(map: number, x: number, y: number) {
    this.gameState.managers.player.warp(this.client, { map, x, y });
  }
}
