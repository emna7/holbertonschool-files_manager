import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on("error", function(error) {
      console.error(error);
    });
    this.clientGet = promisify(this.client.get).bind(this.client);
    this.clientSet = promisify(this.client.set).bind(this.client);
    this.clientDel = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    if (this.client.ping) {
      return true;
    }
    return false;
  }

  async get(key) {
    const value = await this.clientGet(key);
    return value;
  }

  async set(key, value, duration) {
    await this.clientSet(key, value, 'EX', duration);
  }

  async del(key) {
    await this.clientDel(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
