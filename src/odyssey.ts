#!/usr/bin/env node

import * as fs from "fs";
import { OdysseyServer } from "./server/server";
import { AdminServer } from './server/admin/admin-server';
import { GameState } from './server/game-state';

let config: Odyssey.Config;
try {
  config = JSON.parse(fs.readFileSync('odyssey.config.json', 'utf-8'));
} catch (ex) {
  console.error('Unable to read odyssey.config.json');
  console.error(ex);
  process.exit(-1);
}

let gameState = new GameState(config);
this.gameState.start();

let server = new OdysseyServer(gameState, config);
let adminServer = new AdminServer(gameState, config);
