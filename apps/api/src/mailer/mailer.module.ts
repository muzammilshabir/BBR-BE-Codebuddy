import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mailerConfig } from './mailer.config';
import { MailerService } from './mailer.service';

@Module({
  imports: [MailerModule.forRootAsync(mailerConfig)],
  providers: [MailerService, ConfigService],
  exports: [MailerService],
})
export class MailerCoreModule {}
