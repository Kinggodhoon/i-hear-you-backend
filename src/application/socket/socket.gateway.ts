// socket.gateway.ts
import { Socket } from 'socket.io';
import { kickedMessage, SocketEvents, SocketRooms } from './model/socket.model';
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
      // Already disconnected player
      if (!roomId) return
      delete SocketRooms[socket.id]

      const roomKey = await this.cacheService.getRoomKey(roomId);
      // Room not exists
      if (!roomKey) return

      await this.cacheService.removePlayerByRoom(roomKey, socket.id);

      // Broadcast for remain players
      const players = await this.cacheService.getRoomPlayers(roomKey);
      if (players.length > 0) {
        socketService.emitDataToRoom(roomId, SocketEvents.EXIT_ROOM, {
          exitPlayer: socket.id,
          players,
        });
      }
    });

    // Disconnect
    socket.on(SocketEvents.DISCONNECT, async () => {
      console.log('[socket] disconnect ', socket.id);

      const roomId = SocketRooms[socket.id];
      // Already disconnected player
      if (!roomId) return
      delete SocketRooms[socket.id]

      const roomKey = await this.cacheService.getRoomKey(roomId);
      // Room not exists
      if (!roomKey) return

      await this.cacheService.removePlayerByRoom(roomKey, socket.id);

      // Broadcast for remain players
      const players = await this.cacheService.getRoomPlayers(roomKey);
      if (players.length > 0) {
        socketService.emitDataToRoom(roomId, SocketEvents.EXIT_ROOM, {
          exitPlayer: socket.id,
          players,
        });
      }
    });

    // Create room
    socket.on(SocketEvents.CREATE_ROOM, async () => {
      try {
        const roomId = await this.roomsService.generateRoomId();
        console.log('START CREATE ROOM', roomId)

        // create room and join room
        await this.cacheService.createRoom(roomId, 8, socket.id);
        socket.join(roomId);

        SocketRooms[socket.id] = roomId;

        socketService.emitDataToUser(socket.id, 'CREATE_ROOM', roomId);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Modify room
    socket.on(SocketEvents.MODIFY_ROOM, async ({ roomId, maxPlayer }: { roomId: string; maxPlayer: number }) => {
      console.log('START MODIFY_ROOM')
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
      console.log('START EXIT_ROOM')
      try {
        const roomId = SocketRooms[socket.id];
        // already disconnected player
        if (!roomId) return
        delete SocketRooms[socket.id]

        const roomKey = await this.cacheService.getRoomKey(roomId);
        // room not exists
        if (!roomKey) return

        await this.cacheService.removePlayerByRoom(roomKey, socket.id);

        const players = await this.cacheService.getRoomPlayers(roomKey);

        socketService.emitDataToRoom(roomId, SocketEvents.EXIT_ROOM, {
          exitPlayer: socket.id,
          players,
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Peer entering to room
    socket.on(SocketEvents.ENTER_ROOM, async ({ roomId }) => {
      console.log('START ENTER_ROOM')
      try {
        // player cache to room
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new Error('RoomKey not found');

        await this.cacheService.addPlayerToRoom(roomKey, socket.id);

        // socket join in room
        SocketRooms[socket.id] = roomId;
        socket.join(roomId);

        const players = await this.cacheService.getRoomPlayers(roomKey);

        socketService.emitDataToRoom(roomId, SocketEvents.ENTER_ROOM, {
          enterPlayer: socket.id,
          players,
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Peer kicked from room
    socket.on(SocketEvents.KICK_PLAYER, async ({ roomId, kickedPlayerId }) => {
      console.log('START KICK_PLAYER')
      try {
        // player cache to room
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new Error('RoomKey not found');

        // send kicked message to kicked player
        socketService.emitDataToUser(kickedPlayerId, SocketEvents.KICKED_FROM_ROOM, kickedMessage);

        // remove player from room
        await this.cacheService.removePlayerByRoom(roomKey, kickedPlayerId);

        // emit kicked player to room
        const players = await this.cacheService.getRoomPlayers(roomKey);
        socketService.emitDataToRoom(roomId, SocketEvents.KICK_PLAYER, {
          exitPlayer: kickedPlayerId,
          players,
        })
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Offer to client
    socket.on(SocketEvents.SERVE_OFFER, ({ socketId, message }) => {
      console.log('START SERVE_OFFER')
      try {
        if (!SocketRooms[socketId]) throw new Error('Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVE_OFFER, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Answer to client
    socket.on(SocketEvents.SERVER_ANSWER, ({ socketId, message }) => {
      console.log('START SERVER_ANSWER')
      try {
        if (!SocketRooms[socketId]) throw new Error('Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVER_ANSWER, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    // Serve Candidate to client
    socket.on(SocketEvents.SERVE_CANDIDATE, ({ socketId, message }) => {
      console.log('START SERVE_CANDIDATE')
      try {
        if (!SocketRooms[socketId]) throw new Error('Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVE_CANDIDATE, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    });

    socket.on(SocketEvents.START_GAME, async ({ roomId }) => {
      console.log('START START_GAME')
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new Error('RoomKey not found');

        const players = await this.cacheService.getRoomPlayers(roomKey);
        await this.cacheService.deleteRoom(roomKey);

        players.forEach((player) => {
          delete SocketRooms[player];
        });

        socketService.emitDataToRoom(roomId, SocketEvents.START_GAME, null);
      } catch (err) {
        console.error(err);
        socketService.emitErrorToUser(socket.id, 'Something went wrong');
      }
    })
  }
}

export default SocketGateway;
