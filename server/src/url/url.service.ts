import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

import { StatsService } from '../stats/stats.service';
import { DynamodbService } from 'src/common/dynamodb/dynamodb.service';

@Injectable()
export class UrlService {
  constructor(
    private statsService: StatsService,
    private dynamodbService: DynamodbService,
  ) {}
  private tableName = process.env.LINK_TABLE;

  async shortenUrl(
    originalUrl: string,
  ): Promise<{ message: string; id: string }> {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const id = nanoid();

    const createdAt = new Date().toISOString();

    await this.dynamodbService.getDocClient().send(
      new PutCommand({
        TableName: this.tableName,
        Item: { id, originalUrl, createdAt },
      }),
    );

    return { message: 'URL shortened', id };
  }

  async getUrlAndIncrementStats(id: string, platform: string): Promise<string> {
    const result = await this.dynamodbService.getDocClient().send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    const url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

    await this.statsService.incrementStat(id, platform);

    return url;
  }

  async deleteUrl(id: string): Promise<void> {
    await this.dynamodbService.getDocClient().send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    await this.statsService.deleteStats(id);
  }

  async getUrlStats(id: string): Promise<{ hits: number; id: string }> {
    const result = await this.dynamodbService.getDocClient().send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    const visitCount = result.Item?.visitCount;

    if (visitCount) {
      return { hits: visitCount, id };
    }
    return { hits: 0, id };
  }
}
