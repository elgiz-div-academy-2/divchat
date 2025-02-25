import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from 'src/database/entities/User.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FollowService } from './follow/follow.service';

@Controller('users')
@Auth()
export class UserController {
  constructor(
    private userService: UserService,
    private followService: FollowService,
  ) {}

  @Get('profile')
  @Auth()
  getMyProfile() {
    return this.userService.getPublicProfile();
  }

  @Get(':id/followers')
  userFollowers(@Param('id') id: number) {
    return this.followService.userFollowers(id);
  }

  @Get(':id/followings')
  userFollowings(@Param('id') id: number) {
    return this.followService.userFollowings(id);
  }

  @Post('profile')
  @Auth()
  updateMyProfile(@Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(body);
  }

  @Get('profile/:id')
  getProfile(@Param('id') id: number) {
    return this.userService.getPublicProfile(id);
  }
}
