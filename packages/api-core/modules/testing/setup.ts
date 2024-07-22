import fetch, { Headers } from 'node-fetch';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalSetup() {
  console.log('\nStarting Mongodb Memory Server for Testing...');
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 2, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri();
  process.env.__DB_URI = uri;
  (global as any).__MONGO_SERVER = replSet;
  console.log('Mongodb Memory Server Started.');

  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
}
