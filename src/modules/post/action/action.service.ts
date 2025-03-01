import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostActionsEntity } from 'src/database/entities/PostAction.entity';
import { DataSource, Repository } from 'typeorm';
import { PostActionDto } from './dto/action.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from 'src/database/entities/User.entity';
import { PostService } from '../post.service';
import { FollowService } from 'src/modules/user/follow/follow.service';
import { PostActionTypes } from 'src/shared/enums/post.enum';

@Injectable()
export class ActionService {
  private actionRepo: Repository<PostActionsEntity>;

  constructor(
    private followService: FollowService,
    private postService: PostService,
    private cls: ClsService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.actionRepo = this.dataSource.getRepository(PostActionsEntity);
  }

  async toggle(postId: number, params: PostActionDto) {
    const user = this.cls.get<UserEntity>('user');

    let post = await this.postService.findOne(postId);

    if (!post) throw new NotFoundException('Post is not found');

    let checkAccess = await this.followService.userAccessible(
      user.id,
      post.userId,
    );
    if (!checkAccess) throw new ForbiddenException("You're not allowed");

    let action = await this.actionRepo.findOne({
      where: { userId: user.id, postId: post.id, type: params.type },
    });

    if (params.type === PostActionTypes.VIEW && action) {
      throw new ConflictException('Not allowed');
    } else {
      if (action) {
        this.actionRepo.delete({ id: action.id });
        await this.postService.increment(postId, params.type, -1);
        return {
          message: `${params.type} is deleted`,
        };
      } else {
        action = this.actionRepo.create({
          userId: user.id,
          postId,
          type: params.type,
        });

        await action.save();

        await this.postService.increment(postId, params.type, 1);

        return {
          message: `${params.type} is created`,
        };
      }
    }
  }
}
