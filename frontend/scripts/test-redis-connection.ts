import dotenv from 'dotenv';
dotenv.config();

import redisClient from '../src/lib/redis';

async function testConnection() {
  try {
    console.log('Testing Redis connection...');

    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis!');
    }

    await redisClient.set('test-key', 'test-value');
    console.log('Test key set successfully.');

    const value = await redisClient.get('test-key');
    console.log('Test value:', value);

    await redisClient.del('test-key');
    console.log('Test key deleted.');

  } catch (error) {
    console.error('Connection test failed:', error);
  } finally {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis connection closed.');
    }
  }
}

testConnection();