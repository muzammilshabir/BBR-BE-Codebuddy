import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../type/jwt-payload.type';

export const GetCurrentUserId = createParamDecorator(
  async (_: undefined, context: ExecutionContext): Promise<string> => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadType;

    if (!user) return null;

    return user.sub;
  }
);
