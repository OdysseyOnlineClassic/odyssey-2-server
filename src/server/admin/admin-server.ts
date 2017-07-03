import * as express from 'express';
import * as bodyParser from 'body-parser'
import { GameState } from '../game-state';
import players from './controllers/players';

export class AdminServer {
  private server: express.Application;

  constructor(protected gameState: GameState) {
    this.server = express();

    this.server.use(bodyParser.json());

    this.server.use('/', (req, res, next) => {
      req.gameState = this.gameState;
      next();
    });

    players(this.server);

    this.server.listen(3000, "127.0.0.1", () => {
      console.log('Admin server listening on 3000');
    });
  }
}
