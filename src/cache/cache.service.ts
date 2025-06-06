import Redis from 'ioredis';

import Config from '../config/Config';

class CacheService {
  private static singleton: CacheService;

  private redis: Redis | null;

  private constructor() {
    try {
      this.redis = new Redis({
        host: Config.getConfig().REDIS_INFO.host,
        port: Config.getConfig().REDIS_INFO.port,
        password: Config.getConfig().REDIS_INFO.password,
      });
    } catch {
      this.redis = null;
    }
  }

  static async getInstance(): Promise<CacheService> {
    if (!this.singleton) {
      this.singleton = new CacheService();
    }

    return this.singleton;
  }

  public getRoomKey = async (roomId: string): Promise<string | null> => {
    if (!this.redis) return null;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      const rooms = await this.redis!.keys(`${roomId}*`);

      if (rooms.length < 1) return null;

      return rooms[0];
    }

    return null;
  }

  public modifyRoomMaxPlayer = async (roomKey: string, roomId: string, maxPlayer: number): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      await this.redis!.rename(roomKey, `${roomId}-${maxPlayer}`);
    }
  }

  public deleteRoom = async (roomKey: string): Promise<number | null> => {
    if (!this.redis) return null;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      return this.redis!.del(roomKey);
    }

    return null;
  }

  public createRoom = async (roomId: string, maxLength: number, hostSocketId: string): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      await this.redis!.sadd(`${roomId}-${maxLength}`, [hostSocketId]);
    }
  }

  public addPlayerToRoom = async (roomKey: string, playerSocketId: string): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      await this.redis!.sadd(roomKey, playerSocketId)
    }
  }

  public removePlayerByRoom = async (roomKey: string, playerSocketId: string): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      await this.redis!.srem(roomKey, playerSocketId)
    }
  }

  public getRoomPlayers = async (roomKey: string): Promise<string[]> => {
    if (!this.redis) return [];

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      const result = await this.redis!.sscan(roomKey, 0, 'MATCH', '*');

      return result[1];
    }

    return [];
  }
}

export default CacheService;
