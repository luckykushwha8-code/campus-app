import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:conversationId')
  async getMessages(@Request() req, @Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversation')
  async createConversation(@Request() req, @Body() body: { participantId: string }) {
    return this.chatService.createOrGetConversation(req.user.id, body.participantId);
  }
}
