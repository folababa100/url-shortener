import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { customAlphabet } from 'nanoid';

@Injectable()
export class StatsService {
  private ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  private docClient = DynamoDBDocumentClient.from(this.ddbClient);
  private tableName = process.env.STATS_TABLE;

  private async createStat(linkId: string, platform: string): Promise<void> {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const id = nanoid();

    const createdAt = new Date().toISOString();

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          id,
          hits: 1,
          createdAt,
          linkId,
          platform,
          platformCreatedAtId: `${platform}-${linkId}`,
        },
      }),
    );
  }

  private async updateStat(id: string, platform: string): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { linkId: id, platformCreatedAtId: `${platform}-${id}` },
        UpdateExpression: 'ADD hits :inc',
        ExpressionAttributeValues: { ':inc': 1 },
      }),
    );
  }

  async getUrlStat(
    linkId: string,
    platform: string,
  ): Promise<{ id: string; hits: number } | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          linkId,
          platformCreatedAtId: `${platform}-${linkId}`,
        },
      }),
    );

    const { id, hits } = result.Item ?? {};

    if (id) {
      return {
        id,
        hits,
      };
    }

    return null;
  }

  async incrementStat(linkId: string, platform: string): Promise<void> {
    //   Find the stats item in the table and update or create it
    const result = await this.getUrlStat(linkId, platform);
    if (result?.id) {
      await this.updateStat(linkId, platform);
    } else {
      await this.createStat(linkId, platform);
    }
  }

  async deleteStats(linkId: string): Promise<void> {
    const findStats = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'linkId = :linkId',
        ExpressionAttributeValues: { ':linkId': linkId },
      }),
    );

    for (const stat of findStats.Items || []) {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { linkId, platformCreatedAtId: stat.platformCreatedAtId },
        }),
      );
    }
  }
}
