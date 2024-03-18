import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { DynamoModule } from 'src/common/db/dynamo/dynamo.module';

@Module({
  imports: [DynamoModule],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
