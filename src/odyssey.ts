#!/usr/bin/env node

import * as fs from "fs";
import * as Commander from "commander";
import { OdysseyServer } from "./server/server";
import { AdminServer } from './server/admin/admin-server';
import { GameState } from './server/game-state';

Commander
  .option('-c, --config [config]', 'Configuration File')
  .parse(process.argv);

let configFile = Commander.config || 'config/odyssey.config.json';

let config: Odyssey.Config;
try {
  config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
} catch (ex) {
  console.error(`Unable to read ${configFile}`);
  console.error(ex);
  process.exit(-1);
}

let gameState = new GameState(config);
let server = new OdysseyServer(gameState, config);
let adminServer = new AdminServer(gameState, config);
