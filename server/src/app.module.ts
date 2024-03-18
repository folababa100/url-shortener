import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';
import { StatsModule } from './stats/stats.module';
import { DynamoModule } from 'src/common/db/dynamo/dynamo.module';

@Module({
  imports: [ConfigModule.forRoot(), UrlModule, StatsModule, DynamoModule],
})
export class AppModule {}
