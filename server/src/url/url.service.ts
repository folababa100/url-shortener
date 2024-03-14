import AWS from 'aws-sdk';

import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UrlService {
  private docClient = new AWS.DynamoDB.DocumentClient();
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
    return shortUrl;
  }

  async getUrlAndIncrementStats(id: string): Promise<string> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    const url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

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
  }

  async getUrlStats(id: string): Promise<{ hits: number; id: string }> {
    return { hits: 0, id };
  }

  private async incrementStats(id: string): Promise<void> {
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
