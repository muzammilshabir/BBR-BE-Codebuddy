import { Module } from '@nestjs/common';
import { ServiceConfig } from '../config';
import { redisClientFactory } from './redis-client.factory';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [redisClientFactory, RedisService, ServiceConfig],

  exports: ['RedisClient', RedisService],
})
export class RedisModule {}
