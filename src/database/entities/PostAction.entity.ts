import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './User.entity';
import { PostActionTypes } from '../../shared/enums/post.enum';
import { PostEntity } from './Post.entity';

@Entity('post_actions')
export class PostActionsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PostActionTypes })
  type: PostActionTypes;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @ManyToOne(() => UserEntity, (user) => user.postActions, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.actions, { onDelete: 'CASCADE' })
  post: PostEntity;
}
