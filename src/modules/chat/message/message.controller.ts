import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat/:chatId/message')
@Auth()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  chatMessage(@Param('chatId') chatId: number) {
    return this.messageService.chatMessges(chatId);
  }

  @Post()
  createMessage(
    @Param('chatId') chatId: number,
    @Body() body: CreateMessageDto,
  ) {
    return this.messageService.create(chatId, body);
  }
}
