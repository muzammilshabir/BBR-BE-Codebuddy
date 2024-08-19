import { CaptchaEnum, CaptchaResponse } from '@bbr/api-core/modules/types/captcha.type';
import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const recaptchaToken = this.getCaptchaToken(request);

    if (!request['recaptchaRequired']) {
      return true;
    }

    if (!recaptchaToken) {
      return false;
    }

    const isValid = await this.validateCaptcha(recaptchaToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private getCaptchaToken(request: Request): string | null {
    return request.headers[CaptchaEnum.HEADER] || null;
  }

  private async validateCaptcha(token: string): Promise<boolean> {
    const secretKey = this.configService.captcha.secretKey;

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
      const response: CaptchaResponse = await firstValueFrom(this.httpService.post(url));
      return response.data.success && response.data.score > 0.5;
    } catch (error) {
      console.log(`Captcha Validation Failed due to: ${error.message}`);
      return false;
    }
  }
}
