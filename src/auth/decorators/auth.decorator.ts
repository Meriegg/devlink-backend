import { Session, User } from '@prisma/client';
import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const Auth = createParamDecorator((_: string, ctx: ExecutionContext) => {
  const res = ctx.switchToHttp().getResponse();
  if (!res.locals.session) {
    throw new HttpException(
      "Couldn't access your session!",
      HttpStatus.UNAUTHORIZED,
    );
  }

  return res.locals.session as AuthSession;
});

export type AuthSession = Session & { user: User };
