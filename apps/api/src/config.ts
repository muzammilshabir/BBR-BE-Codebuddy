import { BbrStatefulServiceConfig } from '@bbr/api-core/modules/config/bbrStateFullConfig';
import { Injectable } from '@nestjs/common';

/**
 * Base Config for this service
 */
@Injectable()
export class ServiceConfig extends BbrStatefulServiceConfig {
  getServiceName(): string {
    return 'user';
  }

  readonly app = {
    url: this.getOrThrow('SERVICE_URL'),
  };

  readonly db = {
    mongodbUri : this.getOrThrow('DB_URI')
  };
  readonly Jwt = {
    jwtSecretKey : this.getOrThrow('JWT_SECRET_KEY')
  };

  readonly nodemailerHost = {
    nodemailerHost : this.getOrThrow('NODMAILER_HOST')
  };

  readonly nodemailerPort = {
    nodemailerPort : this.getOrThrow('NODMAILER_PORT')
  };

  readonly nodemailerUser = {
    nodemailerUser : this.getOrThrow('NODMAILER_USER')
  };

  readonly nodemailerPass = {
    nodemailerPass : this.getOrThrow('NODMAILER_PASS')
  };

}
