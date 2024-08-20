import { RedisMemoryServer } from 'redis-memory-server';

(async () => {
  const redis = await RedisMemoryServer.create({
    instance: {
      port: 6379,
    },
  });
  const host = await redis.getHost();
  const port = await redis.getPort();
  console.log(`Redis started...!\nConnect at: ${host}:${port}`);
})();
