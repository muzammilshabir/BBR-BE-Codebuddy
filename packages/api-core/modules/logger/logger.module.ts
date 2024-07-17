import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { BbrStatefulServiceConfig } from '../config/bbrStateFullConfig';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [BbrStatefulServiceConfig],
      useFactory: (config: BbrStatefulServiceConfig) => {
        if (config.isTest) {
          return {
            pinoHttp: {
              enabled: false,
            },
          };
        }
        return {
          pinoHttp: {
            autoLogging: false,
            transport: { target: 'pino-pretty' },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
