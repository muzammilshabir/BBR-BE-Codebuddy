import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalTeardown() {
  const mongoInstance: MongoMemoryReplSet = (global as any).__MONGO_SERVER;
  if (mongoInstance) {
    await mongoInstance.stop();
  }
}
