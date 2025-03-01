import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostCommentEntity } from 'src/database/entities/PostComment.entity';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from 'src/database/entities/User.entity';
import { PostService } from '../post.service';
import { UserService } from 'src/modules/user/user.service';
import { FollowService } from 'src/modules/user/follow/follow.service';
import { GetCommentQueryDto } from './dto/get-comment.dto';

@Injectable()
export class CommentService {
  private commentRepo: Repository<PostCommentEntity>;
  constructor(
    private postService: PostService,
    private followService: FollowService,
    private cls: ClsService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.commentRepo = this.dataSource.getRepository(PostCommentEntity);
  }

  async postComments(postId: number, params: GetCommentQueryDto) {
    let user = this.cls.get<UserEntity>('user');

    let post = await this.postService.findOne(postId);

    if (!post) throw new NotFoundException('Post is not found');

    let checkAccess = await this.followService.userAccessible(
      user.id,
      post.userId,
    );
    if (!checkAccess) throw new ForbiddenException('Porifle is private');

    let page = (params.page || 1) - 1;
    let limit = params.limit;
    return this.commentRepo.find({
      where: { postId, replyId: IsNull() },
      relations: [
        'user',
        'user.profile',
        'user.profile.image',
        'replies',
        'replies.user',
        'replies.user.profile',
        'replies.user.profile.image',
      ],
      select: {
        id: true,
        content: true,
        user: {
          id: true,
          username: true,
          profile: {
            id: true,
            image: {
              id: true,
              url: true,
            },
          },
        },
        replyId: true,
        createdAt: true,
        replies: {
          id: true,
          content: true,
          createdAt: true,
          replyId: true,
          user: {
            id: true,
            username: true,
            profile: {
              id: true,
              image: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
      skip: page * limit,
      take: limit,
    });
  }

  async create(postId: number, params: CreateCommentDto) {
    let user = this.cls.get<UserEntity>('user');
    let post = await this.postService.findOne(postId);

    if (!post) throw new NotFoundException('Post is not found');

    let checkAccess = await this.followService.userAccessible(
      user.id,
      post.userId,
    );
    if (!checkAccess) throw new ForbiddenException('Profile is private');

    if (params.replyId) {
      let checkReplyComment = await this.commentRepo.exists({
        where: { id: params.replyId, postId: post.id },
      });
      if (!checkReplyComment)
        throw new NotFoundException('Comment with this reply id is not found');
    }

    let comment = this.commentRepo.create({
      ...params,
      replyId: params.replyId || undefined,
      postId: post.id,
      userId: user.id,
    });

    await comment.save();

    await this.postService.increment(post.id, 'commentCount', 1);

    return comment;
  }

  async delete(commentId: number) {
    const user = this.cls.get<UserEntity>('user');
    let comment = await this.commentRepo.findOne({
      where: { id: commentId },
      select: { id: true, userId: true, post: { id: true, userId: true } },
      relations: ['post'],
    });

    if (!comment) throw new NotFoundException('Comment is not found');

    if (user.id !== comment.userId && user.id !== comment.post.userId) {
      throw new ForbiddenException('You cannot do this action');
    }

    await this.commentRepo.delete({ id: commentId });

    await this.postService.increment(comment.post.id, 'commentCount', -1);

    return {
      message: 'Comment is deleted successfully',
    };
  }
}
