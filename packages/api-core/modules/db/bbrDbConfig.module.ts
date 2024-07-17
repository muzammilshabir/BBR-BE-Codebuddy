import { Module } from '@nestjs/common';
import { DbConfig } from './config';
import { BbrStatefulServiceConfig } from '../config/bbrStateFullConfig';

/**
 * Holds config for the DB module.
 * Due to issues in the order of execution, this needs to be on his own provider and created with a
 * factory so that's injected before the MikroOrmModule
 */
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
