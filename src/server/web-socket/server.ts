import { Server } from 'ws';
import { GameState } from '../../game/game-state';
import { WSClient } from './client';

export class WSServer {
    private server: Server;
    private port: number;

    constructor(private gameState: GameState, port?: number) {
        this.port = port || this.gameState.config.server.port
        this.start();
    }

    start() {
        console.log(`Web Socket Server Listening on ${this.port}`);
        this.server = new Server({
            port: this.port
        });

        this.server.on('connection', this.onConnection.bind(this));
    }

    protected onConnection(socket) {
        console.log(`New web socket connection: ${socket}`);
        let client = new WSClient(socket);
        this.gameState.clients.registerClient(client);
    }
}