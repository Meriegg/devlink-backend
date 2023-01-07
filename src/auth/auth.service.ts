import { uuid } from 'uuidv4';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { CryptoService } from 'src/crypto/crypto.service';
import { AuthSession } from './decorators/auth.decorator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {
    this.sessionExpirationDelay = 6 * 60 * 60 * 1000;
  }

  private sessionExpirationDelay: number;

  private createSessionExpirationDate(delayInMilliseconds: number) {
    return new Date(Date.now() + delayInMilliseconds);
  }

  private async createSession(userId: string) {
    // Create a unique session id
    const sessionId = uuid();

    // Sign the session id so that it can be securely sent to the client
    const { privateKey, publicKey } = this.cryptoService.generateKeyPair();
    console.log(privateKey, publicKey);
    const { signature } = this.cryptoService.createSignedString(sessionId, {
      privateKey,
      publicKey,
    });

    const newSession = await this.prisma.session.create({
      data: {
        userId: userId,
        sessionId: sessionId,
        publicKey: publicKey,
        expirationDate: this.createSessionExpirationDate(
          this.sessionExpirationDelay,
        ),
      },
    });

    const sessionToken = `${sessionId}:${signature}`;

    return {
      sessionToken,
      newSession,
      publicKey,
    };
  }

  async register(body: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: body.email,
          },
          {
            username: body.username,
          },
        ],
      },
    });
    if (existingUser) {
      throw new HttpException(
        'Email or Username may be already taken!',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = this.cryptoService.createHMACString(body.password);
    const newUser = await this.prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        githubAccountLink: body.githubAccountLink,
        country: body.country,
        programmingLanguage: body.programmingLanguage,
      },
    });

    const { newSession, sessionToken } = await this.createSession(newUser.id);

    return {
      user: newUser,
      newSession,
      sessionToken,
    };
  }

  async login(body: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new HttpException(
        "Couldn't find your account!",
        HttpStatus.NOT_FOUND,
      );
    }

    const doPasswordsMatch = this.cryptoService.verifyHMAC(
      user.password,
      body.password,
    );
    if (!doPasswordsMatch) {
      throw new HttpException('Wrong Password!', HttpStatus.UNAUTHORIZED);
    }

    const { newSession, sessionToken } = await this.createSession(user.id);

    return {
      user,
      newSession,
      sessionToken,
    };
  }

  async logout(session: AuthSession) {
    const deletedSession = await this.prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return deletedSession;
  }
}
