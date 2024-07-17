import { Injectable } from '@nestjs/common';
import { BaseConfig } from './baseConfig';

@Injectable()
export abstract class BbrConfig extends BaseConfig {
  abstract getServiceName(): string;

  services = {
    user: {
      port: 4001,
      name: 'API Service',
    },
  };

  port = this.get<number>('APP_PORT');
  name = this.get<string>('APP_NAME');
}
