import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { joiConfig } from '../config/joi.config';
import { JoiPipeModule } from 'nestjs-joi';
import { ResponseModule } from './response/response.module';
import { PaginationModule } from './pagination/pagination.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { LoggerModule } from './logger/logger.module';
import { BbrDbModule } from './db/db.module';

@Module({
  imports: [
    JoiPipeModule.forRoot(joiConfig),
    ConsoleModule,
    ResponseModule,
    PaginationModule,
    HealthCheckModule,
    LoggerModule,
    BbrDbModule,
  ],
  exports: [JoiPipeModule, ConsoleModule, ResponseModule, PaginationModule, BbrDbModule],
})
export class BbrCoreModule {}
