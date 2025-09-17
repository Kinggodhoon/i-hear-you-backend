import { getIO } from '../../../socket-app';
import Config from '../../config/Config';
import { SocketException } from '../../types/exception';
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

  public emitErrorToUser(socketId: string, error: SocketException) {
    const io = getIO();

    // hidden message for production
    const message = Config.isProduction() ? 'Something went wrong' : error.message

    io.to(socketId).emit(SocketEvents.ERROR, {
      code: error.code || 500,
      message,
    });
  }
}

export const socketService = new SocketService();
