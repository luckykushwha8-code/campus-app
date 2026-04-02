import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('update')
  update(@Body() body: any) {
    return this.userService.update(body.userId, body.updates);
  }
}
