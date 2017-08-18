import Location = Odyssey.Location
export class Player {
  constructor(protected gameState: Server.GameState, protected client: Server.Client) {
  }

  get access() {
    return this.client.account.access;
  }

  get location() {
    return this.client.character.location;
  }

  warp(location: Odyssey.Location);
  warp(map: number, x: number, y: number);
  warp(map: number | Odyssey.Location, x?: number, y?: number) {
    if (map instanceof Location) {
      this.gameState.managers.player.warp(this.client, <Location>map);
    } else if (typeof map === 'number') {
      this.gameState.managers.player.warp(this.client, { map, x, y });
    }
  }
}
