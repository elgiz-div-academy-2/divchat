import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './User.entity';
import { FollowStatus } from 'src/shared/enums/follow.enum';

@Entity('follows')
export class FollowEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: FollowStatus })
  status: FollowStatus;

  @Column()
  fromId: number;

  @Column()
  toId: number;

  @ManyToOne(() => UserEntity, (user) => user.following)
  from: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.follower)
  to: UserEntity;
}
