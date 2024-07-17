import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { joiConfig } from '../config/joi.config';
import { JoiPipeModule } from 'nestjs-joi';
import { ResponseModule } from './response/response.module';
import { PaginationModule } from './pagination/pagination.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    JoiPipeModule.forRoot(joiConfig),
    ConsoleModule,
    ResponseModule,
    PaginationModule,
    HealthCheckModule,
    LoggerModule,
  ],
  exports: [JoiPipeModule, ConsoleModule, ResponseModule, PaginationModule],
})
export class BbrCoreModule {}
