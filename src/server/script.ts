
import { GameState } from './game-state';
import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';

export enum Scripts {
  JoinMap = 'JoinMap'
}

export class ScriptManager {
  private context: vm.Context;
  private scripts: { [name: string]: vm.Script } = {};
  private loading: Promise<void[]>;

  constructor(protected gameState: GameState) {
    this.context = vm.createContext({ game: gameState });
    this.loadScripts();
  }

  /**
   * Loads all standard scripts
   *
   * @memberof ScriptManager
   */
  public loadScripts() {
    let normalizedName: string;
    let loadPromises = [];

    for (let name in Scripts) {
      normalizedName = name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`)
      normalizedName = normalizedName.replace(/^-/, '');

      loadPromises.push(
        new Promise<string>((resolve, reject) => {
          fs.readFile(path.join(this.gameState.config.scripts.directory, `${normalizedName}.js`), 'utf8', (err, data) => {
            return err ? reject(err) : resolve(data);
          })
        })
          .then((code) => {
            this.scripts[name] = new vm.Script(code);
          })
      )
    }

    this.loading = Promise.all(loadPromises);
  }

  public runScript(name: string, client: Odyssey.Client) {
    this.loading.then(() => {
      if (!client.scriptContext) {
        client.scriptContext = vm.createContext({ game: this.gameState, player: client, Buffer: Buffer });
      }
      //TODO might we need to run this in a new context?
      this.scripts[name].runInContext(client.scriptContext);
    })
  }
}