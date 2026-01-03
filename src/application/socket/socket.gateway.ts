// socket.gateway.ts
import { Socket } from 'socket.io';
import { kickedMessage, SocketEvents } from './model/socket.model';
import { socketService } from './socket.service';
import CacheService from '../../cache/cache.service';
import RoomsService from '../rooms/rooms.service';
import { RoomSetting } from '../rooms/model/rooms.model';
import { SocketException } from '../../types/exception';
import { loggingError } from '../logger/logger';

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
      const roomId = socketService.getClientRoom(socket.id);

      // Already disconnected player
      if (!roomId) return

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
          hostPlayer: roomKey.split('|')[2],
        });
      }
    });

    // Disconnect
    socket.on(SocketEvents.DISCONNECT, async () => {
      const roomId = socketService.getClientRoom(socket.id);

      // Already disconnected player
      if (!roomId) return

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
          hostPlayer: roomKey.split('|')[2],
        });
      }
    });

    // Create room
    socket.on(SocketEvents.CREATE_ROOM, async () => {
      try {
        const roomId = await this.roomsService.generateRoomId();

        // create room and join room
        await this.cacheService.createRoom(roomId, 8, socket.id);
        await socket.join(roomId);

        socketService.emitDataToUser(socket.id, 'CREATE_ROOM', roomId);
      } catch (err) {
        loggingError('CREATE_ROOM', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Modify room max player
    // TODO: Lagacy remove
    socket.on(SocketEvents.MODIFY_ROOM_MAX_PLAYER, async ({ roomId, maxPlayers }: { roomId: string; maxPlayers: number }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'Room not exists');

        // check host player
        const roomProperties = roomKey.split('|');
        if (socket.id !== roomProperties[2]) throw new SocketException(403, 'Player not a host');

        // check current player count
        const roomPlayers = await this.cacheService.getRoomPlayers(roomKey);
        if (roomPlayers.length > maxPlayers) throw new SocketException(400, 'Invalid max player');

        await this.cacheService.modifyRoomMaxPlayer(roomKey, +maxPlayers);

        socketService.emitDataToRoom(roomId, SocketEvents.MODIFY_ROOM_MAX_PLAYER, {
          maxPlayers,
        });
      } catch (err) {
        loggingError('MODIFY_ROOM_MAX_PLAYER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    socket.on(SocketEvents.MODIFY_ROOM_SETTINGS, async ({ roomId, roomSettings }: { roomId: string; roomSettings: RoomSetting }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'Room not exists');

        // check host player
        const roomProperties = roomKey.split('|');
        if (socket.id !== roomProperties[2]) throw new SocketException(403, 'Player not a host');

        // check is modify maxPlayers setting
        if (+roomProperties[1] !== roomSettings.maxPlayers) {
          // check current player count
          const roomPlayers = await this.cacheService.getRoomPlayers(roomKey);
          if (roomPlayers.length > roomSettings.maxPlayers) throw new SocketException(400, 'Invalid max player');

          await this.cacheService.modifyRoomMaxPlayer(roomKey, roomSettings.maxPlayers);
        }

        socketService.emitDataToRoom(roomId, SocketEvents.MODIFY_ROOM_SETTINGS, {
          roomSettings,
        });
      } catch (err) {
        loggingError('MODIFY_ROOM_MAX_PLAYER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Modify room host player
    socket.on(SocketEvents.MODIFY_ROOM_HOST_PLAYER, async ({ roomId }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'Room not exists');

        await this.cacheService.modifyRoomHost(roomKey, socket.id);

        const players = await this.cacheService.getRoomPlayers(roomKey);

        socketService.emitDataToRoom(roomId, SocketEvents.MODIFY_ROOM_HOST_PLAYER, {
          exitPlayer: socket.id,
          players,
          hostPlayer: roomKey.split('|')[2],
        });
      } catch (err) {
        loggingError('MODIFY_ROOM_HOST_PLAYER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Exit room
    socket.on(SocketEvents.EXIT_ROOM, async () => {
      try {
        const roomId = socketService.getClientRoom(socket.id);

        // already disconnected player
        if (!roomId) return

        const roomKey = await this.cacheService.getRoomKey(roomId);
        // room not exists
        if (!roomKey) return

        await this.cacheService.removePlayerByRoom(roomKey, socket.id);

        const players = await this.cacheService.getRoomPlayers(roomKey);

        socketService.emitDataToRoom(roomId, SocketEvents.EXIT_ROOM, {
          exitPlayer: socket.id,
          players,
          hostPlayer: roomKey.split('|')[2],
        });
      } catch (err) {
        loggingError('EXIT_ROOM', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Peer entering to room
    socket.on(SocketEvents.ENTER_ROOM, async ({ roomId }) => {
      try {
        // player cache to room
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'RoomKey not found');

        // check max player
        const roomProperties = roomKey.split('|');
        const players = await this.cacheService.getRoomPlayers(roomKey);
        if (players.length >= +roomProperties[1]) throw new SocketException(409, 'Room is full');

        await this.cacheService.addPlayerToRoom(roomKey, socket.id);

        // socket join in room
        await socket.join(roomId);

        // exception emit to guest client
        socketService.emitDataToUser(socket.id, SocketEvents.ENTER_ROOM, {
          enterPlayer: socket.id,
          players: [...players, socket.id],
          hostPlayer: roomProperties[2],
        });

        // emit to room players
        socketService.emitDataToRoom(roomId, SocketEvents.ENTER_ROOM, {
          enterPlayer: socket.id,
          players: [...players, socket.id],
          hostPlayer: roomProperties[2],
        });
      } catch (err) {
        loggingError('ENTER_ROOM', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Peer kicked from room
    socket.on(SocketEvents.KICK_PLAYER, async ({ roomId, kickedPlayerId }: { roomId: string, kickedPlayerId: string }) => {
      try {
        // player cache to room
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'RoomKey not found');

        // check host player
        const roomProperties = roomKey.split('|');
        if (socket.id !== roomProperties[2]) throw new SocketException(403, 'Player not a host');

        // send kicked message to kicked player
        socketService.emitDataToUser(kickedPlayerId, SocketEvents.KICKED_FROM_ROOM, kickedMessage);

        // remove player from room
        await this.cacheService.removePlayerByRoom(roomKey, kickedPlayerId);

        // emit kicked player to room
        const players = await this.cacheService.getRoomPlayers(roomKey);
        socketService.emitDataToRoom(roomId, SocketEvents.KICK_PLAYER, {
          exitPlayer: kickedPlayerId,
          players,
          hostPlayer: roomProperties[2],
        })
      } catch (err) {
        loggingError('KICK_PLAYER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Serve Offer to client
    socket.on(SocketEvents.SERVE_OFFER, ({ socketId, message }) => {
      try {
        const isExistsSocket = socketService.checkSocketExists(socketId);
        if (!isExistsSocket) throw new SocketException(404, 'Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVE_OFFER, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        loggingError('SERVE_OFFER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Serve Answer to client
    socket.on(SocketEvents.SERVER_ANSWER, ({ socketId, message }) => {
      try {
        const isExistsSocket = socketService.checkSocketExists(socketId);
        if (!isExistsSocket) throw new SocketException(404, 'Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVER_ANSWER, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        loggingError('SERVER_ANSWER', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    // Serve Candidate to client
    socket.on(SocketEvents.SERVE_CANDIDATE, ({ socketId, message }) => {
      try {
        const isExistsSocket = socketService.checkSocketExists(socketId);
        if (!isExistsSocket) throw new SocketException(404, 'Player not found');

        socketService.emitDataToUser(socketId, SocketEvents.SERVE_CANDIDATE, {
          senderId: socket.id,
          ...message,
        });
      } catch (err) {
        loggingError('SERVE_CANDIDATE', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    });

    socket.on(SocketEvents.START_GAME, async ({ roomId, roomSettings }: { roomId: string, roomSettings: RoomSetting }) => {
      try {
        const roomKey = await this.cacheService.getRoomKey(roomId);
        if (!roomKey) throw new SocketException(404, 'RoomKey not found');

        // check host player
        const roomProperties = roomKey.split('|');
        if (socket.id !== roomProperties[2]) throw new SocketException(403, 'Player not a host');

        await this.cacheService.deleteRoom(roomKey);

        socketService.emitDataToRoom(roomId, SocketEvents.START_GAME, {
          roomSettings,
        });
      } catch (err) {
        loggingError('START_GAME', err as SocketException);
        socketService.emitErrorToUser(socket.id, err as SocketException);
      }
    })
  }
}

export default SocketGateway;
