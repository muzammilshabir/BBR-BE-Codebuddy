import { Module } from '@nestjs/common';
import { DbConfig } from './config';
import { BbrStatefulServiceConfig } from '../config/bbrStateFullConfig';

@Module({
  providers: [
    {
      provide: DbConfig,
      inject: [BbrStatefulServiceConfig],
      useFactory(config: BbrStatefulServiceConfig) {
        return new DbConfig(config);
      },
    },
  ],
  exports: [DbConfig],
})
export class BbrDbConfigModule {}
