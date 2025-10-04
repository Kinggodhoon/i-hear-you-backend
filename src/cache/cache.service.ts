import Redis from 'ioredis';

import Config from '../config/Config';
import { MeteredCredential, TurnIceServer } from '../application/turn/model/turn.model';

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

  public createTurnIces = async (turnIceServers: Array<TurnIceServer>): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      await this.redis!.set('turn_ice_servers', JSON.stringify(turnIceServers), 'EX', Config.getConfig().METERED_INFO.expiryInSeconds - 60);
    }
  }

  public getTurnIces = async (): Promise<string | null> => {
    if (!this.redis) return null;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      const plainTurnIceServers = await this.redis!.get('turn_ice_servers');

      return plainTurnIceServers;
    }

    return null;
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

  public modifyRoomMaxPlayer = async (roomKey: string, maxPlayer: number): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      const roomProperties = roomKey.split('|');

      await this.redis!.rename(roomKey, `${roomProperties[0]}|${maxPlayer}|${roomProperties[2]}`);
    }
  }

  public modifyRoomHost = async (roomKey: string, hostSocketId: string): Promise<void> => {
    if (!this.redis) return;

    const redisPing = await this.redis!.ping();
    if (redisPing === 'PONG') {
      const roomProperties = roomKey.split('|');

      await this.redis!.rename(roomKey, `${roomProperties[0]}|${roomProperties[1]}|${hostSocketId}`);
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
      const redisPipeline = this.redis!.pipeline();
      redisPipeline.sadd(`${roomId}|${maxLength}|${hostSocketId}`, [hostSocketId]);
      redisPipeline.expire(`${roomId}|${maxLength}|${hostSocketId}`, 3600);

      await redisPipeline.exec();
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
