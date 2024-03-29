// url.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Redirect,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UrlService } from './url.service';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/generate')
  async generate(@Body('url') url: string) {
    return this.urlService.shortenUrl(url);
  }

  @Get('/:id')
  @Redirect()
  async redirect(@Param('id') id: string, @Query('platform') platform: string) {
    const url = await this.urlService.getUrlAndIncrementStats(
      id,
      platform ?? 'web',
    );
    return { url, statusCode: 302 };
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.urlService.deleteUrl(id);

    return { message: 'URL deleted' };
  }

  @Get('/:id/stats')
  async stats(@Param('id') id: string) {
    return this.urlService.getUrlStats(id);
  }
}
