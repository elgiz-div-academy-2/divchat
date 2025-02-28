import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProfileEntity } from 'src/database/entities/Profile.entity';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClsService } from 'nestjs-cls';
import { FollowService } from './follow/follow.service';

@Injectable()
export class UserService {
  private userRepo: Repository<UserEntity>;
  private profileRepo: Repository<ProfileEntity>;

  constructor(
    private cls: ClsService,
    @Inject(forwardRef(() => FollowService))
    private followService: FollowService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
    this.profileRepo = this.dataSource.getRepository(ProfileEntity);
  }

  getUser(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async getPublicProfile(userId?: number) {
    userId = userId || this.cls.get<UserEntity>('user')?.id;

    let user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'profile.image'],
    });

    if (!user) throw new NotFoundException('User is not found');

    return {
      ...user,
      password: undefined,
      email: undefined,
      phone: undefined,
    };
  }

  async updateProfile(params: UpdateProfileDto) {
    let user = this.cls.get<UserEntity>('user');

    if (typeof params.isPrivate === 'boolean') {
      await this.userRepo.update(
        { id: user.id },
        { isPrivate: params.isPrivate },
      );

      if (params.isPrivate === false) {
        await this.followService.acceptPendingRequests();
      }

      delete params.isPrivate;
    }
    if (Object.keys(params).length > 0) {
      await this.profileRepo.update({ userId: user.id }, params);
    }
    return {
      message: 'Profile is updated successfully',
    };
  }

  async incrementCount(
    userId: number,
    column: 'follower' | 'following' | 'postCount',
    value: number = 0,
  ) {
    return this.profileRepo.increment({ userId }, column, value);
  }

  list() {
    return this.userRepo.find();
  }

  create() {
    return this.userRepo.save(this.userRepo.create({ username: 'john' }));
  }
}
