import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { MessageEntity } from 'src/database/entities/Message.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UserEntity } from 'src/database/entities/User.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatService } from '../chat.service';
import { ChatParticipant } from 'src/database/entities/Participant.entity';
import { ChatEntity } from 'src/database/entities/Chat.entity';
import { SocketGateway } from 'src/modules/socket/socket.gateway';

@Injectable()
export class MessageService {
  private messageRepo: Repository<MessageEntity>;
  private participantRepo: Repository<ChatParticipant>;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    private cls: ClsService,
    private socketGateway: SocketGateway,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.messageRepo = this.dataSource.getRepository(MessageEntity);
    this.participantRepo = this.dataSource.getRepository(ChatParticipant);
  }

  async chatMessges(chatId: number) {
    let user = this.cls.get<UserEntity>('user');

    let chat = await this.chatService.getChat(chatId);

    if (!chat) throw new NotFoundException('Chat is not found');

    let checkParticipant = chat.participants.some(
      (participant) => participant.userId === user.id,
    );

    if (!checkParticipant) throw new NotFoundException('Chat is not found');

    await this.participantRepo.update(
      { userId: user.id, chatId: chat.id },
      { unreadCount: 0 },
    );

    return this.messageRepo.find({
      where: { chatId: chat.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          id: true,
          username: true,
          profile: {
            id: true,
            image: {
              id: true,
              url: true,
            },
          },
        },
      },
      relations: ['user', 'user.profile', 'user.profile.image'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(chatId: number, params: CreateMessageDto) {
    let user = this.cls.get<UserEntity>('user');

    let chat = await this.chatService.getChat(chatId);

    if (!chat) throw new NotFoundException('Chat is not found');

    let checkParticipant = chat.participants.some(
      (participant) => participant.userId === user.id,
    );

    if (!checkParticipant) throw new NotFoundException('Chat is not found');

    let message = this.messageRepo.create({
      content: params.content,
      chatId: chat.id,
      userId: user.id,
    });

    await message.save();

    let rooms = this.socketGateway.server.to(
      chat.participants.map((participant) => `user_${participant.userId}`),
    );
    rooms.emit('message-created', { id: message.id });

    chat.lastMessage = message;

    await chat.save();

    rooms.emit('chat-updated', { id: chat.id });

    await this.participantRepo.increment(
      { chatId: chat.id, userId: Not(user.id) },
      'unreadCount',
      1,
    );

    return {
      message: 'Message created successfully',
    };
  }
}
