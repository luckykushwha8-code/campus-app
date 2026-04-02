import { Controller, Post, Get, Body } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly service: StoriesService) {}
  @Post('upload')
  upload(@Body() dto: any) {
    return this.service.upload(dto);
  }
  @Get('feed')
  feed() {
    return this.service.feed();
  }
}
