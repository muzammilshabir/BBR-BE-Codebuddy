import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

@Injectable()
export class RedisService {
  constructor(@Inject(RedisRepository) private readonly redisRepository: RedisRepository) {}
  // Common methods can be implemented here for better reusability
}
