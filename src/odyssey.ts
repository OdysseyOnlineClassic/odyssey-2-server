#!/usr/bin/env node

import * as Commander from "commander";
import { OdysseyServer } from "./server/server";

interface InterfaceCLI extends Commander.ICommand {
  port: number
}

Commander
  .option('-p, --port [port]', 'Server Port')
  .parse(process.argv);

let server = new OdysseyServer(Commander.port || 5751);
server.start();
