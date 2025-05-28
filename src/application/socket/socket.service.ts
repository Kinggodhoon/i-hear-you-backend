import { getIO } from '../../../socket-app';
import { SocketEvents } from './model/socket.model';

class SocketService {
  public emitDataToRoom(roomId: string, event: string, data: any) {
    const io = getIO();

    io.to(roomId).emit(event, data);
  }

  public emitDataToUser(socketId: string, event: string, data: any) {
    const io = getIO();

    io.to(socketId).emit(event, data);
  }

  public emitErrorToUser(socketId: string, message: string) {
    const io = getIO();

    io.to(socketId).emit(SocketEvents.ERROR, message);
  }
}

export const socketService = new SocketService();
