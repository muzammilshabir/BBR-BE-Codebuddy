import { Module } from '@nestjs/common';
import { CalendlyWebhookController } from './calendlyWebhook.controller';
import { CalendlyWebhookGuard } from './calendlyWebhook.guard';
import { CalendlyWebhookService } from './calendlyWebhook.service';
import { ServiceConfig } from 'src/config';

@Module({
  controllers: [CalendlyWebhookController],
  providers: [CalendlyWebhookGuard, CalendlyWebhookService, ServiceConfig],
})
export class CalendlyWebhookModule {}
