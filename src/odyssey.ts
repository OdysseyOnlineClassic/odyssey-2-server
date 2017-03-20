import * as Commander from "commander";
import {OdysseyServer} from "./server/server";

interface InterfaceCLI extends Commander.ICommand {
  port: number
}

/*let args: InterfaceCLI = new Commander.Command('args');
args.option('-p, --port <n>', 'Port to listen on', '5750');
args.parse(process.argv);*/

let server = new OdysseyServer(5751);
server.start();

/*let decoder = new StringDecoder.StringDecoder('utf-8');

const PORT = 5751;
const server = net.createServer((c) => {
  console.log(`client connected ${c.remoteAddress}`);
  c.on('data', (chunk) => {
    let index = 0;

    while(index <= chunk.length - 1) {
        let length = chunk.readInt16BE(index + 0);
        let checksum = chunk.readInt8(index + 2);
        let order = chunk.readInt8(index + 3);
        let msgId = chunk.readInt8(index + 4);
        console.log(length);
        console.log(chunk.length);
        console.log(checksum);
        console.log(order);
        console.log(msgId);
        if(msgId == 61) {
          console.log(`Client Version: ${chunk.readInt8(index + 5)}`);
          console.log(chunk.toString('utf-8', index + 5, index + length + 5));
        }
        else if(msgId == 0) {
          console.log(chunk.toString('utf-8', index + 5, index + length + 5));
          c.write(Buffer.from([0, 1, 0, 1, 2]));
        }
        index += length + 4
    }
  })
})

console.log(`Listening on ${PORT}`);
server.listen(PORT);

server.on('error', (err) => {
  console.log(err);
})*/

