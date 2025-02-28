import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostEntity } from 'src/database/entities/Post.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from 'src/database/entities/User.entity';
import { UserService } from '../user/user.service';
import { FollowService } from '../user/follow/follow.service';
import { UserPostsQueryDto } from './dto/uesr-posts.dto';

@Injectable()
export class PostService {
  private postRepo: Repository<PostEntity>;

  constructor(
    private cls: ClsService,
    private followService: FollowService,
    private userService: UserService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.postRepo = this.dataSource.getRepository(PostEntity);
  }

  async findOne(id: number, relations: string[] = []) {
    return this.postRepo.findOne({ where: { id }, relations });
  }

  async userPosts(userId: number, params: UserPostsQueryDto) {
    const user = this.cls.get<UserEntity>('user');

    let currentUser =
      userId === user.id ? user : await this.userService.getUser(userId);

    if (!currentUser) throw new NotFoundException('User is not found');

    let checkAccess = await this.followService.userAccessible(
      user.id,
      currentUser.id,
    );
    if (!checkAccess) throw new ForbiddenException('Profile is private');

    let page = (params.page || 1) - 1;
    let limit = params.limit || 10;

    let [posts, total] = await this.postRepo.findAndCount({
      where: {
        userId,
      },
      relations: ['media'],
      order: {
        createdAt: 'DESC',
      },
      skip: page * limit,
      take: limit,
    });

    return {
      posts,
      total,
    };
  }

  async create(params: CreatePostDto) {
    let user = this.cls.get<UserEntity>('user');

    let post = this.postRepo.create({
      ...params,
      media: params.media.map((id) => ({ id })),
      userId: user.id,
    });

    await post.save();

    await this.userService.incrementCount(user.id, 'postCount', 1);

    return post;
  }

  async increment(postId: number, value: number = 0) {
    return this.postRepo.increment({ id: postId }, 'commentCount', value);
  }
}
