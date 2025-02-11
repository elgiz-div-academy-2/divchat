import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileEntity } from './Profile.entity';
import { FollowEntity } from './Follow.entity';
import { PostEntity } from './Post.entity';
import { PostActionsEntity } from './PostAction.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isPrivate: boolean;

  @OneToMany(() => FollowEntity, (follow) => follow.to)
  follower: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.from)
  following: FollowEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile: ProfileEntity;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => PostActionsEntity, (action) => action.user)
  postActions: PostActionsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
