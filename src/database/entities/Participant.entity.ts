import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './User.entity';
import { ChatEntity } from './Chat.entity';

@Entity('participants')
export class ChatParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  chat: ChatEntity;

  @Column({ default: 0 })
  unreadCount: number;
}
