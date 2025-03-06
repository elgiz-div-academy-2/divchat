import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, CreateChatGroupDto } from './dto/create-chat.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { UpdateChatGroupDto } from './dto/update-chat.dto';

@Controller('chat')
@Auth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  myChatList() {
    return this.chatService.myChatList();
  }

  @Post()
  createChat(@Body() body: CreateChatDto) {
    return this.chatService.createChat(body);
  }

  @Post('/group')
  createChatGroup(@Body() body: CreateChatGroupDto) {
    return this.chatService.createChatGroup(body);
  }

  @Post(':chatId')
  updateChat(
    @Param('chatId') chatId: number,
    @Body() body: UpdateChatGroupDto,
  ) {
    return this.chatService.updateChatGroup(chatId, body);
  }
}
