import { BbrStatefulServiceConfig } from '@bbr/api-core/modules/config/bbrStateFullConfig';
import { Injectable } from '@nestjs/common';

/**
c */
@Injectable()
export class ServiceConfig extends BbrStatefulServiceConfig {
  getServiceName(): string {
    return 'user';
  }

  readonly app = {
    url: this.getOrThrow('SERVICE_URL'),
  };

  readonly db = {
    mongodbUri: this.getOrThrow('DB_URI'),
  };
  readonly jwt = {
    atSecret: this.getOrThrow('JWT_AT_SECRET'),
    rtSecret: this.getOrThrow('JWT_RT_SECRET'),
  };

  readonly nodemailer = {
    nodemailerHost: this.getOrThrow('NODMAILER_HOST'),
    nodemailerPort: this.getOrThrow('NODMAILER_PORT'),
    nodemailerUser: this.getOrThrow('NODMAILER_USER'),
    nodemailerPass: this.getOrThrow('NODMAILER_PASS'),
  };

  readonly s3 = {
    region: this.getOrThrow('AWS_S3_BUCKET_REGION'),
    accessKeyId: this.getOrThrow('AWS_S3_USER_ACCESS_KEY_ID'),
    secretAccessKey: this.getOrThrow('AWS_S3_USER_SECRET'),
    bucket: this.getOrThrow('AWS_S3_BUCKET_NAME'),
    endpoint: this.getOrThrow('END_POINT'),
  };

  readonly redis = {
    user: this.getOrThrow('APP_REDIS_USER'),
    host: this.getOrThrow('APP_REDIS_HOST'),
    port: this.getOrThrow<number>('APP_REDIS_PORT'),
    db: this.getOrThrow<number>('APP_REDIS_DB'),
    password: this.get('APP_REDIS_PASSWORD'),
    defaultExpiry: this.getOrThrow<number>('APP_REDIS_DEFAULT_EXPIRY'),
  };

  readonly captcha = {
    secretKey: this.getOrThrow('CAPTCHA_SECRET'),
    isDisabled: this.getOrThrow('CAPTCHA_DISABLED') == 1,
  };

  readonly stripe = {
    apiKey: this.getOrThrow('STRIPE_API_KEY'),
    secretKey: this.getOrThrow('STRIPE_SECRET_KEY'),
    successPage: this.getOrThrow('STRIPE_SUCCESS_PAGE'),
    cancelPage: this.getOrThrow('STRIPE_CANCEL_PAGE'),
    redirectPage: this.getOrThrow('STRIPE_REDIRECT_PAGE'),
    webhookSecret: this.getOrThrow('STRIPE_WEBHOOK_SECRET'),
  };
}
