import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { joiConfig } from '../config/joi.config';
import { JoiPipeModule } from 'nestjs-joi';
import { ResponseModule } from './response/response.module';
import { PaginationModule } from './pagination/pagination.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { LoggerModule } from './logger/logger.module';
import { BbrDbModule } from './db/db.module';
import { FixturesModule } from './fixture/fixture.module';

@Module({
  imports: [
    JoiPipeModule.forRoot(joiConfig),
    ConsoleModule,
    ResponseModule,
    PaginationModule,
    HealthCheckModule,
    LoggerModule,
    BbrDbModule,
    HealthCheckModule,
    FixturesModule,
  ],
  exports: [
    JoiPipeModule,
    ConsoleModule,
    ResponseModule,
    PaginationModule,
    BbrDbModule,
    HealthCheckModule,
    FixturesModule,
  ],
})
export class BbrCoreModule {}
