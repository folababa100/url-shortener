import { Injectable } from '@nestjs/common';
import { DynamoService } from './dynamo.service';

@Injectable()
export class DynamoServiceFactory {
  createDynamoService(tableName: string): DynamoService {
    return new DynamoService(tableName);
  }
}
