import { Module } from '@nestjs/common';
import { DynamoService } from 'src/common/db/dynamo/dynamo.service';

@Module({
  providers: [DynamoService],
  exports: [DynamoService],
})
export class DynamoModule {}
