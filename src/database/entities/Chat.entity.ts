import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './User.entity';
import { MessageEntity } from './Message.entity';
import { ChatParticipant } from './Participant.entity';

@Entity('chat')
export class ChatEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isGroup: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  adminId: number;

  @Column({ nullable: true })
  lastMessageId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'adminId' })
  admin: UserEntity;

  @OneToMany(() => ChatParticipant, (participant) => participant.chat, {
    cascade: true,
  })
  participants: ChatParticipant[];

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];

  @OneToOne(() => MessageEntity)
  @JoinColumn({
    name: 'lastMessageId',
  })
  lastMessage: MessageEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
