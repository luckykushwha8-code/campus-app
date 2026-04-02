import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post('create')
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get('feed')
  feed(@Query() q: any) {
    return this.service.feed(q);
  }
}
