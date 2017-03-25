import * as Commander from "commander";
import {OdysseyServer} from "./server/server";

interface InterfaceCLI extends Commander.ICommand {
  port: number
}

let server = new OdysseyServer(5751);
server.start();
