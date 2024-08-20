import {
  CaptchaRequiredException,
  CaptchaValidationFailedException,
  InvalidCaptchaTokenException,
} from '@bbr/api-core/modules/exceptions/captcha.exceptions';
import { CaptchaEnum, CaptchaResponse } from '@bbr/api-core/modules/types/captcha.type';
import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ServiceConfig } from '../../config';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ServiceConfig
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const captchaToken = this.getCaptchaToken(request);

    // Create a middleware to set captcha when required
    if (!request['captchaRequired'] && !captchaToken) {
      return true;
    }

    if (!captchaToken) {
      // Send a reason from the middleware
      throw new CaptchaRequiredException(request['captchaReason']);
    }

    await this.validateCaptchaOrThrow(captchaToken);

    return true;
  }

  private getCaptchaToken(request: Request): string | null {
    return request.headers[CaptchaEnum.HEADER] || null;
  }

  private async validateCaptchaOrThrow(token: string): Promise<boolean> {
    const secretKey = this.configService.captcha.secretKey;

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
      const response: CaptchaResponse = await firstValueFrom(this.httpService.post(url));

      if (!(response.data.success && response.data.score > 0.5)) {
        throw new CaptchaValidationFailedException();
      }

      return true;
    } catch (error) {
      console.log(`Captcha Validation Failed due to: ${error}`);

      throw new InvalidCaptchaTokenException();
    }
  }
}
