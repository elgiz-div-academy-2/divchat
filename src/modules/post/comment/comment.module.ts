import { Module } from '@nestjs/common';
import { PostModule } from '../post.module';
import { FollowModule } from 'src/modules/user/follow/follow.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [PostModule, FollowModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
