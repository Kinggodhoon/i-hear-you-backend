// socket.gateway.ts
import { Socket } from 'socket.io';
import { SocketEvents, SocketRooms } from './model/socket.model';
import { socketService } from './socket.service';
import CacheService from '../../cache/cache.service';
import RoomsService from '../rooms/rooms.service';

class SocketGateway {
  private cacheService: CacheService;
  private roomsService: RoomsService;

  constructor() {
    CacheService.getInstance().then((instance) => {
      this.cacheService = instance;
    });
    this.roomsService = new RoomsService();
  }

  handleConnection(socket: Socket) {
    // PING PONG
    socket.on(SocketEvents.PING, () => {
      socket.emit('pong');
    });

    // Disconnecting
    socket.on(SocketEvents.DISCONNECTING, async () => {
      console.log('[socket] disconnecting ', socket.id);

      const roomId = SocketRooms[socket.id];
      // already disconnected player
      if (!roomId) return
      delete SocketRooms[socket.id]

      const roomKey = await this.cacheService.getRoomKey(roomId);
      // room not exists
      if (!roomKey) return

      await this.cacheService.removePlayerByRoom(roomKey, socket.id);
    });

    // Disconnect
    socket.on(SocketEvents.DISCONNECT, async () => {
      console.log('[socket] disconnect ', socket.id);

      const roomId = SocketRooms[socket.id];
      // already disconnected player
      if (!roomId) return
      delete SocketRooms[socket.id]

      const roomKey = await this.cacheService.getRoomKey(roomId);
      // room not exists
      if (!roomKey) return

      await this.cacheService.removePlayerByRoom(roomKey, socket.id);
    });

    // Create room
    socket.on(SocketEvents.CREATE_ROOM, async () => {
      try {
        const roomId = await this.roomsService.generateRoomId();

        // create room and join room
        await this.cacheService.createRoom(roomId, 8, socket.id);
        socket.join(roomId);

        SocketRooms[socket.id] = roomId;

        console.log(SocketRooms)

        socketService.emitDataToUser(socket.id, 'CREATE_ROOM', roomId);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Modify room
    socket.on(SocketEvents.MODIFY_ROOM, async ({ roomId, maxPlayer }: { roomId: string; maxPlayer: number }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new Error('Room not exists');

        await this.cacheService.modifyRoomMaxPlayer(roomKey, roomId, +maxPlayer);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Exit room
    socket.on(SocketEvents.EXIT_ROOM, async () => {
      try {
        const roomId = SocketRooms[socket.id];
        // already disconnected player
        if (!roomId) return
        delete SocketRooms[socket.id]

        const roomKey = await this.cacheService.getRoomKey(roomId);
        // room not exists
        if (!roomKey) return

        await this.cacheService.removePlayerByRoom(roomKey, socket.id);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Peer entering to room
    socket.on(SocketEvents.ENTER_ROOM, async ({ roomId }) => {
      try {
        // player cache to room
        console.log(roomId)
        const roomKey = await this.cacheService.getRoomKey(roomId);
        console.log(roomKey)
        if (!roomKey) throw new Error('RoomKey not found');

        this.cacheService.addPlayerToRoom(roomKey, socket.id);

        // socket join in room
        SocketRooms[socket.id] = roomId;
        socket.join(roomId);

        socketService.emitDataToRoom(roomId, SocketEvents.ENTER_ROOM, socket.id);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Offer to client
    socket.on(SocketEvents.SERVE_OFFER, ({ socketId, message }) => {
      try {
        console.log(SocketRooms)
        if (!SocketRooms[socketId]) throw new Error('Player not found');
        socketService.emitDataToUser(socketId, SocketEvents.SERVE_OFFER, message);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Answer to client
    socket.on(SocketEvents.SERVER_ANSWER, ({ socketId, message }) => {
      try {
        console.log(SocketRooms)
        if (!SocketRooms[socketId]) throw new Error('Player not found');
        socketService.emitDataToUser(socketId, SocketEvents.SERVER_ANSWER, message);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Candidate to client
    socket.on(SocketEvents.SERVE_CANDIDATE, ({ socketId, message }) => {
      try {
        console.log(SocketRooms)
        if (!SocketRooms[socketId]) throw new Error('Player not found');
        socketService.emitDataToUser(socketId, SocketEvents.SERVE_CANDIDATE, message);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    socket.on(SocketEvents.START_GAME, async ({ roomId }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new Error('RoomKey not found');

        const players = await this.cacheService.getRoomPlayers(roomKey);
        await this.cacheService.deleteRoom(roomKey);

        players.forEach((player) => {
          delete SocketRooms[player];
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    })
  }
}

export default SocketGateway;
