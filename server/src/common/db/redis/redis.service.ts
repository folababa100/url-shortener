import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<string> {
    return this.redis.set(key, value, 'EX', process.env.CACHE_EXPIRY_TIME);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
