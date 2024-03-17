import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';
import { StatsModule } from './stats/stats.module';
import { DynamodbModule } from './common/dynamodb/dynamodb.module';

@Module({
  imports: [ConfigModule.forRoot(), UrlModule, StatsModule, DynamodbModule],
})
export class AppModule {}
