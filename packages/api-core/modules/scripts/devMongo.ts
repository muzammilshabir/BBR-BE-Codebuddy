import { MongoMemoryReplSet } from 'mongodb-memory-server';

(async () => {
  const replSet = await MongoMemoryReplSet.create({
    binary: {
      version: '7.0.11',
    },
    replSet: { count: 2, storageEngine: 'wiredTiger' },
    instanceOpts: [{ port: 27017 }, { port: 27018 }],
  });
  const uri = replSet.getUri();
  const dbName = 'test';
  const uriWithDb = uri.replace('/?', `/${dbName}?`);
  console.log(`Mongod started...!\nConnect at: ${uriWithDb}`);
})();
