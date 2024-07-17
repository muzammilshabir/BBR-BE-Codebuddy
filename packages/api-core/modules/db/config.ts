import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../config/baseConfig';
import { BbrStatefulServiceConfig } from '../config/bbrStateFullConfig';

/**
 * Config with DB related settings
 */
@Injectable()
export class DbConfig extends BaseConfig {
  constructor(private readonly base: BbrStatefulServiceConfig) {
    super();
  }

  database = this.getOrThrow('DB_DATABASE');
  username = this.getOrThrow('DB_USERNAME');
  password = this.getOrThrow('DB_PASSWORD');
  host = this.getOrThrow('DB_HOST');
  port = this.getOrThrow('DB_PORT');
  debug = this.isDev;
}
