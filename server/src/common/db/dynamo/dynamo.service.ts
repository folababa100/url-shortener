import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService {
  private readonly ddbClient: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly table: string;

  constructor(table: string) {
    this.ddbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
    });
    this.docClient = DynamoDBDocumentClient.from(this.ddbClient);

    this.table = table;
  }

  getDocClient(): DynamoDBDocumentClient {
    return this.docClient;
  }

  put(params: any): Promise<any> {
    return this.docClient.send(
      new PutCommand({
        TableName: this.table,
        Item: params,
      }),
    );
  }

  get(params: any): Promise<any> {
    return this.docClient.send(
      new GetCommand({
        TableName: this.table,
        Key: params,
      }),
    );
  }

  delete(params: any): Promise<any> {
    return this.docClient.send(
      new DeleteCommand({
        TableName: this.table,
        Key: params,
      }),
    );
  }
}
