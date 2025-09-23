export const SocketRooms: {[key: string]: string} = {};

export enum SocketEvents {
  // Socket essential events
  PING = 'ping',
  DISCONNECTING = 'disconnecting',
  DISCONNECT = 'disconnect',

  // Room properties
  CREATE_ROOM = 'CREATE_ROOM',
  MODIFY_ROOM_MAX_PLAYER = 'MODIFY_ROOM_MAX_PLAYER', // TODO: remove
  MODIFY_ROOM_SETTINGS = 'MODIFY_ROOM_SETTINGS',
  MODIFY_ROOM_HOST_PLAYER = 'MODIFY_ROOM_HOST_PLAYER',

  // Player chnages
  ENTER_ROOM = 'ENTER_ROOM',
  KICK_PLAYER = 'KICK_PLAYER',
  KICKED_FROM_ROOM = 'KICKED_FROM_ROOM',
  EXIT_ROOM = 'EXIT_ROOM',

  // WebRTC connection data
  SERVE_OFFER = 'SERVER_OFFER',
  SERVER_ANSWER = 'SERVE_ANSWER',
  SERVE_CANDIDATE = 'SERVE_CANDIDATE',

  // Utils
  START_GAME = 'START_GAME',
  ERROR = 'ERROR',
}

export const kickedMessage = {
  message: 'You were kicked out of the room by host.',
};
