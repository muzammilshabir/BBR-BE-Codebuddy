import { Module } from '@nestjs/common';
import { ServiceConfig } from '../../config';
import { redisClientFactory } from './redis-client.factory';
import { RedisRepository } from './redis.repository';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [redisClientFactory, RedisRepository, RedisService, ServiceConfig],

  exports: [RedisService],
})
export class RedisModule {}
