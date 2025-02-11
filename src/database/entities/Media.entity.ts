import { MediaTypes } from 'src/shared/enums/media.enum';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from './Post.entity';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MediaTypes })
  type: MediaTypes;

  @Column()
  url: string;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => PostEntity, (post) => post.media, { onDelete: 'CASCADE' })
  post: PostEntity;
}
