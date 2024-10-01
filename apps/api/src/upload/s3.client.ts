import { Inject, Injectable } from '@nestjs/common';
import { ServiceConfig } from '../config';
import { S3Client as S3 } from '@aws-sdk/client-s3';
import { BbrStatefulServiceConfig } from '@bbr/api-core/modules/config/bbrStateFullConfig';

@Injectable()
export class S3ClientFactory {
  constructor(
    @Inject(BbrStatefulServiceConfig)
    private readonly config: ServiceConfig
  ) {}

  createClient() {
    return new S3({
      region: this.config.s3.region,
      ...(this.config.s3.endpoint && {
        endpoint: `https://${this.config.s3.endpoint}`,
      }),
      credentials: {
        accessKeyId: this.config.s3.accessKeyId,
        secretAccessKey: this.config.s3.secretAccessKey,
      },
    });
  }
}
