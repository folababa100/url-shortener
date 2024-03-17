import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamodbService {
  private readonly ddbClient: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    this.ddbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
    });
    this.docClient = DynamoDBDocumentClient.from(this.ddbClient);
  }

  getDocClient(): DynamoDBDocumentClient {
    return this.docClient;
  }
}
