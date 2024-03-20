import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

import { StatsService } from '../stats/stats.service';
import { DynamoServiceFactory } from 'src/common/db/dynamo/dynamo.service.factory';
import { DynamoService } from 'src/common/db/dynamo/dynamo.service';
import { RedisService } from 'src/common/db/redis/redis.service';

@Injectable()
export class UrlService {
  private readonly nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    6,
  );
  private dynamoService: DynamoService;

  constructor(
    private statsService: StatsService,
    private dynamoServiceFactory: DynamoServiceFactory,
    private redisService: RedisService,
  ) {
    this.dynamoService = this.dynamoServiceFactory.createDynamoService(
      process.env.LINK_TABLE,
    );
  }

  async shortenUrl(
    originalUrl: string,
  ): Promise<{ message: string; id: string }> {
    const id = this.nanoid();

    const createdAt = new Date().toISOString();

    await this.dynamoService.put({ id, originalUrl, createdAt });

    return { message: 'URL shortened', id };
  }

  async getUrlAndIncrementStats(id: string, platform: string): Promise<string> {
    const result = await this.dynamoService.get({ id });
    await this.redisService.set(id, 'true');

    const url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

    await this.statsService.incrementStat(id, platform);

    return url;
  }

  async deleteUrl(id: string): Promise<void> {
    await this.dynamoService.delete({ id });
    await this.statsService.deleteStats(id);
  }

  async getUrlStats(id: string): Promise<{ hits: number }> {
    return await this.statsService.getStats(id);
  }
}
