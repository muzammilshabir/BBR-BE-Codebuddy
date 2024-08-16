import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ServiceConfig } from '../../config';
import { IRedisGetPayload, IRedisSetPayload, RedisRepositoryInterface } from './redis.type';

@Injectable()
export class RedisService implements RedisRepositoryInterface {
  constructor(
    @Inject('RedisClient') private readonly redisClient: Redis,
    private readonly configService: ServiceConfig
  ) {}

  async get(payload: IRedisGetPayload): Promise<string | null> {
    return this.redisClient.get(`${payload.prefix}:${payload.key}`);
  }

  async set(payload: IRedisSetPayload): Promise<void> {
    await this.redisClient.set(
      `${payload.prefix}:${payload.key}`,
      payload.value,
      'EX',
      payload.expiry || this.configService.redis.defaultExpiry
    );
  }

  async delete(payload: IRedisGetPayload): Promise<void> {
    await this.redisClient.del(`${payload.prefix}:${payload.key}`);
  }
}
