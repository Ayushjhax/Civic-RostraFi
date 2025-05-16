import { createClient } from 'redis';

const redisClient = createClient({
  username: process.env.REDIS_USERNAME, 
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST, 
    port: parseInt(process.env.REDIS_PORT || '16310') 
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
})();

export default redisClient;