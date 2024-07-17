import { Injectable } from '@nestjs/common';
import { BaseConfig } from './baseConfig';

@Injectable()
export abstract class BbrConfig extends BaseConfig {
  abstract getServiceName(): string;

  services = {
    user: {
      port: 4001,
      name: 'User Service',
    },
  };

  port = this.get<number>('APP_PORT');
  name = this.get<string>('APP_NAME');

  readonly jwt = {
    atSecret: this.getOrThrow('AT_SECRET'),
    rtSecret: this.getOrThrow('RT_SECRET'),
  };
}
