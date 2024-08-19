import { ClassProvider, DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BbrConfig } from './bbrConfig';
import { BbrStatefulServiceConfig } from './bbrStateFullConfig';

@Global()
@Module({})
export class BbrConfigModule {
  static forRoot(options: Pick<ClassProvider<BbrConfig>, 'useClass'>): DynamicModule {
    return {
      module: BbrConfigModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '../../.env'],
          isGlobal: true,
          cache: true,
        }),
      ],
      providers: [
        {
          provide: BbrStatefulServiceConfig,
          useClass: options.useClass,
        },
        {
          provide: BbrConfig,
          useExisting: BbrStatefulServiceConfig,
        },
      ],
      exports: [BbrStatefulServiceConfig, BbrConfig],
    };
  }
}
