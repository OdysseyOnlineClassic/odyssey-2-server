/**
 * Provides an object for scripts to interact with the players
 *
 * @export
 * @class Player
 */
export class Player {
  protected account;
  protected character: Odyssey.Character;
  protected players: Server.Managers.PlayerManager;

  constructor(protected gameState: Server.GameState, protected client: Server.Client) {
    this.account = client.account;
    this.character = client.character;

    this.players = gameState.managers.player;
  }

  get access() {
    return this.account.access;
  }

  set access(access: number) {
    this.account.access = access;
  }

  get ammo(): number {
    return this.character.ammo;
  }

  set ammo(ammo: number) {
    this.character.ammo = ammo;
  }

  get class(): number {
    return this.character.class;
  }

  set class(playerClass: number) {
    this.character.class = playerClass;
  }

  get description(): string {
    return this.character.description;
  }

  set description(description: string) {
    this.character.description = description;
  }

  get female(): boolean {
    return this.character.female;
  }

  set female(isFemale: boolean) {
    this.character.female = isFemale;
  }

  get guild(): Odyssey.GuildAssociation {
    return this.character.guild;
  }

  get location(): Odyssey.Location {
    return this.character.location;
  }

  set location(location: Odyssey.Location) {
    this.gameState.managers.player.warp(this.client, location);
  }

  get name(): string {
    return this.character.name;
  }

  set name(name: string) {
    this.character.name = name;
    this.players.updateName(this.client);
  }

  get sprite(): number {
    return this.character.sprite;
  }

  set sprite(sprite: number) {
    this.character.sprite = sprite;
  }

  get stats(): Odyssey.Stats {
    return this.character.stats;
  }

  get status(): number {
    return this.character.status;
  }

  set status(status: number) {
    this.character.status = status;
  }

  get timers(): any {
    return this.character.timers;
  }

  //TODO Bank
  //TODO Equipped
  //TODO Inventory
}
