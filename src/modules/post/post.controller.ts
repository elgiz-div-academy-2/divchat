import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { UserPostsQueryDto } from './dto/uesr-posts.dto';

@Controller('post')
@Auth()
export class PostController {
  constructor(private postService: PostService) {}

  @Get('user/:userId')
  userPosts(
    @Param('userId') userId: number,
    @Query() query: UserPostsQueryDto,
  ) {
    return this.postService.userPosts(userId, query);
  }

  @Post()
  create(@Body() body: CreatePostDto) {
    return this.postService.create(body);
  }
}
