import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { UserPostsQueryDto } from './dto/uesr-posts.dto';
import { PaginationDto } from 'src/shared/dto/pagniation.dto';

@Controller('post')
@Auth()
export class PostController {
  constructor(private postService: PostService) {}

  @Get('feed')
  myFeed(@Query() query: PaginationDto) {
    return this.postService.feed(query);
  }

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
