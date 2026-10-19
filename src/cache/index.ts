import { redis } from '../config';
import { createClient } from 'redis';
import Logger from '../core/Logger';

const redisURL = redis.password
  ? `redis://:${redis.password}@${redis.host}:${redis.port}`
  : `redis://${redis.host}:${redis.port}`;

const client = createClient({
  url: redisURL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        Logger.warn('Max Redis reconnect attempts reached. Cache disabled or unreachable.');
        return new Error('Max retries reached');
      }
      return Math.min(retries * 500, 3000);
    },
  },
});

client.on('connect', () => Logger.info('Cache is connecting'));
client.on('ready', () => Logger.info('Cache is ready'));
client.on('end', () => Logger.info('Cache disconnected'));
client.on('reconnecting', () => Logger.info('Cache is reconnecting'));
client.on('error', (e) => Logger.error('Redis error: ' + e));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    Logger.error('Failed to connect to Redis: ' + err);
  }
})();

// If the Node process ends, close the Cache connection
process.on('SIGINT', async () => {
  try {
    await client.disconnect();
  } catch (err) {
    // ignore
  }
});

export default client;
