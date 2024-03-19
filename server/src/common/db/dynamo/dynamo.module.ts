import { Module } from '@nestjs/common';
import { DynamoServiceFactory } from './dynamo.service.factory';

@Module({
  providers: [DynamoServiceFactory],
  exports: [DynamoServiceFactory],
})
export class DynamoModule {}
