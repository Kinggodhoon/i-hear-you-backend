import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

import SocketGateway from './src/application/socket/socket.gateway';
import Config from './src/config/Config';

let io: IOServer;
const socketGateway = new SocketGateway();

export function initSocket(server: http.Server) {
  io = new IOServer(server, {
    cors: { origin: Config.getConfig().cors },
  });

  io.on('connection', (socket: Socket) => {
    socketGateway.handleConnection(socket);
  });
}

export function getIO() {
  return io;
}
