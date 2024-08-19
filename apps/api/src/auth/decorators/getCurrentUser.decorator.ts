import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadType } from '../type/jwt-payload.type';

export const GetCurrentUser = createParamDecorator(
  async (
    data: keyof JwtPayloadType | undefined,
    context: ExecutionContext
  ): Promise<Partial<JwtPayloadType>> => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as JwtPayloadType;
    if (!user) throw new UnauthorizedException('Invalid token');

    if (!data) return user;

    return request.user[data];
  }
);
