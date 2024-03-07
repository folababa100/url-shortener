import { Injectable, NotFoundException } from '@nestjs/common';
import AWS from 'aws-sdk';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UrlService {
  private docClient = new AWS.DynamoDB.DocumentClient();
  private redisClient = new IORedis(process.env.REDIS_ENDPOINT);
  private tableName = process.env.DYNAMODB_TABLE_NAME;

  async shortenUrl(originalUrl: string): Promise<string> {
    const id = uuidv4().slice(0, 8); // Simple example, consider a more collision-resistant approach
    const shortUrl = `${process.env.BASE_URL}/${id}`;

    await this.docClient
      .put({
        TableName: this.tableName,
        Item: { id, originalUrl },
      })
      .promise();

    await this.redisClient.set(id, originalUrl);

    return shortUrl;
  }

  async getUrlAndIncrementStats(id: string): Promise<string> {
    // Try to get URL from Redis
    let url = await this.redisClient.get(id);
    if (url) {
      await this.incrementStats(id); // Increment stats in both Redis and DynamoDB
      return url;
    }

    // If not in Redis, fetch from DynamoDB
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

    // Cache URL back in Redis and increment stats
    await this.redisClient.set(id, url);
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
    await this.redisClient.del(id);
    await this.redisClient.del(`hits:${id}`);
  }

  async getUrlStats(id: string): Promise<{ hits: number }> {
    const hits = await this.redisClient.get(`hits:${id}`);

    if (!hits) {
      return { hits: 0 };
    }
    return { hits: Number(hits) };
  }

  private async incrementStats(id: string): Promise<void> {
    // Increment in Redis
    await this.redisClient.incr(`${id}:count`);

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
