import * as redis from 'redis';

async function getRedisClient() {
  const client = await redis.createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  return client;
}

export { getRedisClient };
