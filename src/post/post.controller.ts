import { Controller, UseGuards, Post, Body, Get } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PostService } from './post.service';
import { Auth, AuthSession } from 'src/auth/decorators/auth.decorator';
import { CreatePostDto, DeletePostDto, EditPostDto, GetPostDto } from './dto';

@UseGuards(AuthGuard)
@Controller('post')
export class PostController {
  constructor(private PostService: PostService) {}

  @Post('/createPost')
  async createPost(@Auth() session: AuthSession, @Body() body: CreatePostDto) {
    return this.PostService.createPost(session, body);
  }

  @Post('/deletePost')
  async deletePost(@Auth() session: AuthSession, @Body() body: DeletePostDto) {
    return this.PostService.deletePost(session, body);
  }

  @Post('/editPost')
  async editPost(@Auth() session: AuthSession, @Body() body: EditPostDto) {
    return this.PostService.editPost(session, body);
  }

  @Get('/getHomepagePosts')
  async getHomepagePosts() {
    return this.PostService.getHomepagePosts();
  }

  @Get('/getPost')
  async getPost(@Body() body: GetPostDto) {
    return this.PostService.getPost(body);
  }
}
