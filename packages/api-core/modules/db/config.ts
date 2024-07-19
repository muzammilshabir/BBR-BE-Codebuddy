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

  mongodbUri = this.getOrThrow('DB_URI');
  debug = this.isDev;
}
