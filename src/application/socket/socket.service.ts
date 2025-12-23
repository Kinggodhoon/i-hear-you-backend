import { getIO } from '../../../socket-app';
import Config from '../../config/Config';
import { SocketException } from '../../types/exception';
import { SocketEvents } from './model/socket.model';

class SocketService {
  public checkSocketExists(socketId: string): boolean {
    const io = getIO();

    const target = io.sockets.sockets.get(socketId);

    return !!target;
  }

  public isClientInRoom(socketId: string, roomId: string): boolean {
    const io = getIO();

    const target = io.sockets.sockets.get(socketId);
    if (!target) return false;

    return target.rooms.has(roomId);
  }

  public getClientRoom(socketId: string): string | null {
    const io = getIO();

    const target = io.sockets.sockets.get(socketId);
    if (!target) return null;

    const rooms = Array.from(target.rooms).filter(
      (roomId) => roomId !== socketId,
    );

    return rooms[0] ?? null;
  }

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
