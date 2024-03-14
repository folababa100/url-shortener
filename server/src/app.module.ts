import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './url/url.module';

@Module({
  imports: [ConfigModule.forRoot(), UrlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
