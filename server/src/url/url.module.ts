import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { StatsModule } from '../stats/stats.module';
import { DynamodbModule } from '../common/dynamodb/dynamodb.module';

@Module({
  imports: [StatsModule, DynamodbModule],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
