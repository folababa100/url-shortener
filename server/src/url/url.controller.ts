// url.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Redirect,
  Delete,
  Param,
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
  async redirect(@Param('id') id: string) {
    const url = await this.urlService.getUrlAndIncrementStats(id);
    return { url, statusCode: 302 };
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.urlService.deleteUrl(id);
  }

  @Get('/:id/stats')
  async stats(@Param('id') id: string) {
    return this.urlService.getUrlStats(id);
  }
}
