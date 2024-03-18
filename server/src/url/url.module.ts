import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { StatsModule } from '../stats/stats.module';
import { DynamoModule } from 'src/common/db/dynamo/dynamo.module';

@Module({
  imports: [StatsModule, DynamoModule],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
