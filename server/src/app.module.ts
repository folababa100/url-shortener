import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [ConfigModule.forRoot(), UrlModule, StatsModule],
})
export class AppModule {}
