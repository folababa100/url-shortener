import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DynamodbModule } from '../common/dynamodb/dynamodb.module';

@Module({
  imports: [DynamodbModule],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
