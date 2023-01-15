import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Auth, AuthSession } from 'src/auth/decorators/auth.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto';

@Controller('/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/updateProfile')
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @Auth() session: AuthSession,
  ) {
    return this.userService.updateProfile(body, session);
  }

  @Get('/me')
  async getMe(@Auth() session: AuthSession) {
    return session.user;
  }

  @Get('/session')
  async getSession(@Auth() session: AuthSession) {
    return session;
  }
}
