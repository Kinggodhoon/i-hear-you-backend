import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

import SocketGateway from './src/application/socket/socket.gateway';

let io: IOServer;
const socketGateway = new SocketGateway();

export function initSocket(server: http.Server) {
  io = new IOServer(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket: Socket) => {
    console.log('[socket] connected:', socket.id);

    socket.join('abc');

    socketGateway.handleConnection(socket);
  });
}

export function getIO() {
  return io;
}
