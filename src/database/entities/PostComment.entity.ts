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
import { PostEntity } from './Post.entity';

@Entity('post_comments')
export class PostCommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: 'CASCADE' })
  post: PostEntity;

  @Column({ nullable: true })
  replyId: number;

  @ManyToOne(() => PostCommentEntity, (comment) => comment.replies)
  replyTo: PostCommentEntity;

  @OneToMany(() => PostCommentEntity, (comment) => comment.replyTo)
  @JoinColumn({
    name: 'replyId',
    referencedColumnName: 'id',
  })
  replies: PostCommentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
