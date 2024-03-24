import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const options = {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    };
    this.redis = new Redis(options);

    this.redis.on('connect', () => this.logger.log('Connected to Redis.'));
    this.redis.on('error', (error) => this.logger.error('Redis error', error));
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<string> {
    return this.redis.set(
      key,
      value,
      'EX',
      Number(process.env.REDIS_EXPIRY_TIME),
    );
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
