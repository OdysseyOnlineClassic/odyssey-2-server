export interface ProcessFunction {
  (msg: Server.Message): void;
}

export abstract class MessageProcessor {
  protected processors: { [id: number]: ProcessFunction } = {};
  constructor(protected game: Server.GameState) {
  }

  async process(msg: Server.Message): Promise<any> {
    this.processors[msg.id](msg);
  }
}
