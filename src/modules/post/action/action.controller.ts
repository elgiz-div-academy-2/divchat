import { Body, Controller, Param, Post } from '@nestjs/common';
import { ActionService } from './action.service';
import { PostActionDto } from './dto/action.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('post/:postId/action')
@Auth()
export class ActionController {
  constructor(private actionService: ActionService) {}

  @Post()
  toggle(@Body() body: PostActionDto, @Param('postId') postId: number) {
    return this.actionService.toggle(postId, body);
  }
}
