export const SocketRooms: {[key: string]: string} = {};

export enum SocketEvents {
  PING = 'ping',
  DISCONNECTING = 'disconnecting',
  DISCONNECT = 'disconnect',

  CREATE_ROOM = 'CREATE_ROOM',
  MODIFY_ROOM = 'MODIFY_ROOM',
  ENTER_ROOM = 'ENTER_ROOM',
  EXIT_ROOM = 'EXIT_ROOM',
  SERVE_OFFER = 'SERVER_OFFER',
  SERVER_ANSWER = 'SERVE_ANSWER',
  SERVE_CANDIDATE = 'SERVE_CANDIDATE',
  START_GAME = 'START_GAME',
}
