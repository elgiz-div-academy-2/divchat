import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { FollowService } from './follow.service';
import {
  RemoveFollowerDto,
  ToggleFollowRequestDto,
  UpdateFollowStatusDto,
} from './dto/send-follow.dto';

@Controller('follow')
@Auth()
export class FollowController {
  constructor(private followService: FollowService) {}

  @Get('pendings')
  pendingRequests() {
    return this.followService.pendingRequests();
  }

  @Post()
  toggleFollowRequest(@Body() body: ToggleFollowRequestDto) {
    return this.followService.toggleFollowRequest(body);
  }

  @Post('toggle')
  updateFollowStatus(@Body() body: UpdateFollowStatusDto) {
    return this.followService.updateFollowStatus(body);
  }

  @Post('remove-follower')
  removeFollower(@Body() body: RemoveFollowerDto) {
    return this.followService.removeFollower(body);
  }
}
