import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ServiceConfig } from 'src/config';
import * as crypto from 'crypto';

@Injectable()
export class CalendlyWebhookGuard implements CanActivate {
  private logger = new Logger(CalendlyWebhookGuard.name);
  constructor(private readonly appConfigService: ServiceConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();

    const signature = request.headers['calendly-webhook-signature'];
    if (!signature || signature === '') {
      this.logger.error('No Calendly signature found in the request headers');
      throw new BadRequestException('No Calendly signature found in the request headers');
    }

    const signatureStr = Array.isArray(signature) ? signature[0] : signature;
    const [timestampPart, signaturePart] = signatureStr.split(',');
    const timestamp = timestampPart.split('=')[1];
    const v1Signature = signaturePart.split('=')[1];

    const payload = `${timestamp}.${request.rawBody}`;

    const computedSignature = crypto
      .createHmac('sha256', this.appConfigService.calendly.webhookSecret)
      .update(payload)
      .digest('hex');

    // Compare signatures securely
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedSignature as any) as any,
      Buffer.from(v1Signature as any) as any
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    return true;
  }
}
