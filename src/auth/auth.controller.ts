import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { Auth, AuthSession } from './decorators/auth.decorator';
import { Get } from '@nestjs/common/decorators';

@Controller('/auth')
export class AuthController {
  constructor(private AuthProvider: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDto) {
    return this.AuthProvider.register(body);
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.AuthProvider.login(body);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Auth() session: AuthSession) {
    return this.AuthProvider.logout(session);
  }
}
