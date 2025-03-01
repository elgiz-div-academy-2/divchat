import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { FollowModule } from '../user/follow/follow.module';
import { CommentModule } from './comment/comment.module';
import { ActionModule } from './action/action.module';

@Module({
  imports: [FollowModule, CommentModule, ActionModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
