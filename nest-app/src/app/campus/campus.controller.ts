import { Controller, Get, Query } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Get('feed')
  feed(@Query('limit') limit?: string) {
    return this.campusService.feed(limit ? Number(limit) : 10);
  }
}
