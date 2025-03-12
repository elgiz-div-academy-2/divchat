import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { ChatEntity } from 'src/database/entities/Chat.entity';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateChatDto, CreateChatGroupDto } from './dto/create-chat.dto';
import { UserService } from '../user/user.service';
import { ChatParticipant } from 'src/database/entities/Participant.entity';
import { MessageEntity } from 'src/database/entities/Message.entity';
import { MessageService } from './message/message.service';
import { UpdateChatGroupDto } from './dto/update-chat.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ChatService {
  private chatRepo: Repository<ChatEntity>;
  private participantRepo: Repository<ChatParticipant>;
  private messageRepo: Repository<MessageEntity>;

  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    private userService: UserService,
    private cls: ClsService,
    private socketGateway: SocketGateway,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.chatRepo = this.dataSource.getRepository(ChatEntity);
    this.participantRepo = this.dataSource.getRepository(ChatParticipant);
    this.messageRepo = this.dataSource.getRepository(MessageEntity);
  }

  async getChat(chatId: number) {
    return this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['participants'],
    });
  }

  async myChatList() {
    let user = this.cls.get<UserEntity>('user');

    const chatList = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoin('chat.participants', 'myParticipant')
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.image', 'image')
      .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.user', 'lastMessageUser')
      .leftJoinAndSelect('lastMessageUser.profile', 'lastMessageProfile')
      .leftJoinAndSelect('lastMessageProfile.image', 'lastMessageImage')
      .where('myParticipant.userId = :userId', { userId: user.id })
      .select([
        'chat.id',
        'chat.name',
        'chat.isGroup',
        'chat.createdAt',
        'chat.updatedAt',
        'chat.adminId',
        'participants.id',
        'participants.unreadCount',
        'user.id',
        'user.username',
        'profile.id',
        'image.id',
        'image.url',
        'lastMessage.id',
        'lastMessage.content',
        'lastMessage.createdAt',
        'lastMessageUser.id',
        'lastMessageUser.username',
        'lastMessageProfile.id',
        'lastMessageImage.id',
        'lastMessageImage.url',
      ])
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();

    return chatList.map((chat) => ({
      ...chat,
      unreadCount:
        chat.participants.find((participant) => participant.user.id === user.id)
          ?.unreadCount || 0,
    }));
  }
  async getItem(id: number) {
    let user = this.cls.get<UserEntity>('user');

    const chat = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoin('chat.participants', 'myParticipant')
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.image', 'image')
      .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.user', 'lastMessageUser')
      .leftJoinAndSelect('lastMessageUser.profile', 'lastMessageProfile')
      .leftJoinAndSelect('lastMessageProfile.image', 'lastMessageImage')
      .where('myParticipant.userId = :userId', { userId: user.id })
      .andWhere(`chat.id =:id`, { id })
      .select([
        'chat.id',
        'chat.name',
        'chat.isGroup',
        'chat.createdAt',
        'chat.updatedAt',
        'chat.adminId',
        'participants.id',
        'participants.unreadCount',
        'user.id',
        'user.username',
        'profile.id',
        'image.id',
        'image.url',
        'lastMessage.id',
        'lastMessage.content',
        'lastMessage.createdAt',
        'lastMessageUser.id',
        'lastMessageUser.username',
        'lastMessageProfile.id',
        'lastMessageImage.id',
        'lastMessageImage.url',
      ])
      .orderBy('chat.updatedAt', 'DESC')
      .getOne();

    if (!chat) throw new NotFoundException('error');

    return {
      ...chat,
      unreadCount:
        chat.participants.find((participant) => participant.user.id === user.id)
          ?.unreadCount || 0,
    };
  }

  async createChat(params: CreateChatDto) {
    let user = this.cls.get<UserEntity>('user');

    if (params.userId === user.id)
      throw new BadRequestException('You cannot send message to yourself');

    let currentUser = await this.userService.getUser(params.userId);

    if (!currentUser) throw new NotFoundException('Uesr is not found');

    let myChats = await this.chatRepo
      .createQueryBuilder('c')
      .leftJoin('c.participants', 'myParticipant')
      .leftJoinAndSelect('c.participants', 'participants')
      .select(['c.id', 'participants.id', 'participants.userId'])
      .where('c.isGroup = FALSE')
      .andWhere('myParticipant.userId =:userId', { userId: user.id })
      .getMany();

    let chat = myChats.find((chat) =>
      chat.participants.some(
        (participant) => participant.userId === currentUser.id,
      ),
    );

    if (!chat) {
      let participants: ChatParticipant[] = [];

      participants.push(this.participantRepo.create({ userId: user.id }));
      participants.push(
        this.participantRepo.create({ userId: currentUser.id }),
      );

      chat = this.chatRepo.create({
        participants,
      });

      await chat.save();
    }

    await this.messageService.create(chat.id, { content: params.message });

    return {
      message: 'Chat is created',
    };
  }

  async createChatGroup(params: CreateChatGroupDto) {
    let user = this.cls.get<UserEntity>('user');

    if (params.participants.includes(user.id)) {
      throw new BadRequestException('Something went wrong');
    }

    let participantIds = [...new Set(params.participants), user.id];

    let checkUsers = await this.userService.getUsers(participantIds);

    if (checkUsers.length != participantIds.length) {
      throw new NotFoundException('Some of participants are not found');
    }

    let participants = participantIds.map((userId) =>
      this.participantRepo.create({ userId }),
    );

    let chat = this.chatRepo.create({
      name: params.name,
      adminId: user.id,
      isGroup: true,
      participants,
    });

    await chat.save();

    return {
      message: 'Chat group is created successfully',
      chat,
    };
  }

  async updateChatGroup(chatId: number, params: UpdateChatGroupDto) {
    let user = this.cls.get<UserEntity>('user');

    let chat = await this.chatRepo.findOne({
      where: { id: chatId, isGroup: true },
      relations: ['participants'],
    });

    if (!chat) throw new NotFoundException('Chat is not found');

    if (chat?.adminId !== user.id) {
      throw new ForbiddenException("You're not allowed to update this chat");
    }

    if (params.name) {
      chat.name = params.name;
    }

    if (params.participants) {
      let participantIds = [...new Set(params.participants)];

      let checkUsers = await this.userService.getUsers(participantIds);

      if (checkUsers.length != participantIds.length) {
        throw new NotFoundException('Some of participants are not found');
      }

      let participants = participantIds.map((userId) => {
        let check = chat.participants.find(
          (participant) => participant.userId === userId,
        );

        return check || this.participantRepo.create({ userId });
      });

      let deleteParticipant = chat.participants.filter(
        (participant) => !participantIds.includes(participant.id),
      );
      let deleteParticipantIds = deleteParticipant.map(
        (participant) => participant.id,
      );
      await this.participantRepo.delete({ id: In(deleteParticipantIds) });

      chat.participants = participants;

      await chat.save();

      return {
        message: 'Chat is updated successfully',
        chat,
      };
    }
  }
}
