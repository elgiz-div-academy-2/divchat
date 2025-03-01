import { forwardRef, Module } from '@nestjs/common';
import { PostModule } from '../post.module';
import { ActionController } from './action.controller';
import { ActionService } from './action.service';
import { FollowModule } from 'src/modules/user/follow/follow.module';

@Module({
  imports: [forwardRef(() => PostModule), FollowModule],
  controllers: [ActionController],
  providers: [ActionService],
})
export class ActionModule {}
