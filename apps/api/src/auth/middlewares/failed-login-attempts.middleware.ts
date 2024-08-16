import { CaptchaRedisPrefix } from '@bbr/api-core/modules/types/captcha.type';
import { ExceptionCodes } from '@bbr/api-core/modules/types/exceptionCodes.type';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class FailedLoginAttemptsMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip;

    let failedAttempts = await this.redisService.get({
      prefix: CaptchaRedisPrefix.PREFIX,
      key: clientIp,
    });

    if (!failedAttempts) {
      failedAttempts = '0';
    }

    if (Number(failedAttempts) >= 5) {
      throw new UnauthorizedException({
        errorCode: ExceptionCodes.TooManyFailedLoginAttempts,
        message: 'Too many failed login attempts',
      });
    }

    next();
  }
}
