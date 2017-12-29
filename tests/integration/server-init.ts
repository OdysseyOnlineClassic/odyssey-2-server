import { AdminServer } from '../../src/server/admin/admin-server';
import { GameState } from '../../src/game/game-state';
import { ClassicServer } from '../../src/server/classic/server';

const config = {
  server: {
    port: 5751,
    adminPort: 3000,
    log: {
      level: 'info',
      file: 'integration.log'
    },
    interval: 100
  },
  scripts: {
    directory: 'scripts'
  }
}

let gameState = new GameState(config);
let server = new ClassicServer(gameState);
let adminServer = new AdminServer(gameState);
