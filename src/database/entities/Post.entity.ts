import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './User.entity';
import { MediaEntity } from './Media.entity';
import { PostActionsEntity } from './PostAction.entity';
import { PostCommentEntity } from './PostComment.entity';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  like: number;

  @Column({ default: 0 })
  view: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column()
  content: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: 'CASCADE' })
  user: UserEntity;

  @OneToMany(() => MediaEntity, (media) => media.post)
  media: MediaEntity[];

  @OneToMany(() => PostActionsEntity, (action) => action.post)
  actions: PostActionsEntity[];

  @OneToMany(() => PostCommentEntity, (comment) => comment.post)
  comments: PostCommentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
