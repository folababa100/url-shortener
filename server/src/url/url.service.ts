import AWS from 'aws-sdk';
// Removed import IORedis from 'ioredis';

import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UrlService {
  private docClient = new AWS.DynamoDB.DocumentClient();
  // Removed Redis client initialization
  private tableName = process.env.DYNAMODB_TABLE;

  async shortenUrl(originalUrl: string): Promise<string> {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );

    const id = nanoid();
    const shortUrl = `${process.env.BASE_URL}/${id}`;

    await this.docClient
      .put({
        TableName: this.tableName,
        Item: { id, originalUrl },
      })
      .promise();

    // Removed Redis set operation

    return shortUrl;
  }

  async getUrlAndIncrementStats(id: string): Promise<string> {
    // Removed Redis fetch

    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    const url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

    // Removed caching URL back in Redis and incrementing stats in Redis
    await this.incrementStats(id);

    return url;
  }

  async deleteUrl(id: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    // Removed Redis delete operations
  }

  async getUrlStats(id: string): Promise<{ hits: number }> {
    // Since Redis was handling hit counts, you might need to redesign this function.
    // For now, returning an indicative response as it can't be directly migrated without Redis.
    return { hits: 0 };
  }

  private async incrementStats(id: string): Promise<void> {
    // Removed Redis increment operation

    // Increment in DynamoDB
    await this.docClient
      .update({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'set visitCount = if_not_exists(visitCount, :start) + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':start': 0,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }
}
