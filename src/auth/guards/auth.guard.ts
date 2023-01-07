import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private crypto: CryptoService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const token = req.headers['authorization'].split('Bearer ')[1];
    if (!token) {
      return false;
    }

    const [sessionId, signedSessionId] = token.split(':');
    const dbSession = await this.prisma.session.findUnique({
      where: {
        sessionId,
      },
      include: {
        user: true,
      },
    });
    if (!dbSession) {
      return false;
    }

    // Verify if session has expired
    const now = Date.now();
    const sessionExpiration = dbSession.expirationDate.getTime();
    if (now > sessionExpiration) {
      await this.prisma.session.delete({
        where: {
          sessionId,
        },
      });

      return false;
    }

    // Check token validity
    const isValidSessionID = this.crypto.verifySignedString(
      sessionId,
      signedSessionId,
      dbSession.publicKey,
    );
    if (!isValidSessionID) {
      return false;
    }

    res.locals.session = dbSession;

    return true;
  }
}
