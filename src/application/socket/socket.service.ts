import { getIO } from '../../../socket-app';

class SocketService {
  public emitDataToRoom(roomId: string, event: string, data: any) {
    const io = getIO();

    io.to(roomId).emit(event, data);
  }

  public emitDataToUser(socketId: string, event: string, data: any) {
    const io = getIO();

    io.to(socketId).emit(event, data);
  }
}

export const socketService = new SocketService();
