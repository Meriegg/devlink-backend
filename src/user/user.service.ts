import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthSession } from 'src/auth/decorators/auth.decorator';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(body: UpdateProfileDto, session: AuthSession) {
    const updatedProfile = await this.prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...body,
      },
    });

    return updatedProfile;
  }
}
