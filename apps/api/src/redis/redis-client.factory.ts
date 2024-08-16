import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ServiceConfig } from '../config';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: (config: ServiceConfig) => {
    const redisInstance = new Redis({
      username: config.redis.user,
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      password: config.redis.password,
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [ServiceConfig],
};
