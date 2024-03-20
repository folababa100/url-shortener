import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { StatsModule } from '../stats/stats.module';
import { DynamoModule } from 'src/common/db/dynamo/dynamo.module';
import { RedisModule } from 'src/common/db/redis/redis.module';

@Module({
  imports: [StatsModule, DynamoModule, RedisModule],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
