import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
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
import * as bcrypt from 'bcrypt';
import { UserProvider } from 'src/shared/enums/user.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserProvider, default: UserProvider.LOCAL })
  provider: UserProvider;

  @Column({ nullable: true })
  providerId: string;

  @Column({ default: false })
  isPrivate: boolean;

  @OneToMany(() => FollowEntity, (follow) => follow.to)
  follower: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.from)
  following: FollowEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user, { cascade: true })
  profile: ProfileEntity;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => PostActionsEntity, (action) => action.user)
  postActions: PostActionsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async beforeUpsert() {
    if (!this.password) return;

    this.password = await bcrypt.hash(this.password, 10);
  }
}
