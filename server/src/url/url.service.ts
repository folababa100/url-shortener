import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UrlService {
  private ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  private docClient = DynamoDBDocumentClient.from(this.ddbClient);
  private tableName = process.env.DYNAMODB_TABLE;

  async shortenUrl(
    originalUrl: string,
  ): Promise<{ message: string; id: string }> {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const id = nanoid();

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { id, originalUrl },
      }),
    );

    return { message: 'URL shortened', id };
  }

  async getUrlAndIncrementStats(id: string): Promise<string> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    const url = result.Item?.originalUrl;
    if (!url) throw new NotFoundException('URL not found');

    await this.incrementStats(id);

    return url;
  }

  async deleteUrl(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
  }

  async getUrlStats(id: string): Promise<{ hits: number; id: string }> {
    const result = await this.docClient.send(
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

  private async incrementStats(id: string): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'set visitCount = if_not_exists(visitCount, :start) + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,

          ':start': 0,
        },
        ReturnValues: 'UPDATED_NEW',
      }),
    );
  }
}
