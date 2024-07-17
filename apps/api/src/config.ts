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
    url: this.getOrThrow('USER_SERVICE_URL'),
  };

  readonly db = {
    host: this.getOrThrow('DB_HOST'),
    port: this.getOrThrow('DB_PORT'),
    username: this.getOrThrow('DB_USERNAME'),
    password: this.getOrThrow('DB_PASSWORD'),
    database: this.getOrThrow('DB_NAME'),
  };
}
