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
  readonly Jwt = {
    jwtSecretKey: this.getOrThrow('JWT_SECRET_KEY'),
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
    cdnUrl: this.getOrThrow('AWS_S3_CDN_URL'),
    endpoint: this.getOrThrow('END_POINT'),
  };
}
