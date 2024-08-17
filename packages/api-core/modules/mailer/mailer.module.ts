import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('NODMAILER_HOST'),
          port: configService.get<number>('NODMAILER_PORT'),
          auth: {
            user: configService.get<string>('NODMAILER_USER'),
            pass: configService.get<string>('NODMAILER_PASS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService, ConfigService],
  exports: [MailerService],
})
export class MailerCoreModule {}
