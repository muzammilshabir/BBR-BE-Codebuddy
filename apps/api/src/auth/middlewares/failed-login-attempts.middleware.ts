import { CaptchaEnum } from '@bbr/api-core/modules/types/captcha.type';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class FailedLoginAttemptsMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip;

    let failedAttempts = await this.redisService.get({
      prefix: CaptchaEnum.PREFIX,
      key: clientIp,
    });

    if (!failedAttempts) {
      failedAttempts = '0';
    }

    if (Number(failedAttempts) >= 5) {
      req['captchaRequired'] = true;
      req['captchaReason'] = 'Too many failed login attempts';
    }

    next();
  }
}
