#!/usr/bin/env node

import * as Commander from "commander";
import { OdysseyServer } from "./server/server";
import { AdminServer } from './server/admin/admin-server';
import { GameState } from './server/game-state';

interface InterfaceCLI extends Commander.ICommand {
  port: number
}

Commander
  .option('-p, --port [port]', 'Server Port')
  .parse(process.argv);

let gameState = new GameState();

let server = new OdysseyServer(gameState, Commander.port || 5751);
server.start();
let adminServer = new AdminServer(gameState);
