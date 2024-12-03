import { Module } from '@nestjs/common';
import { CalendlyWebhookController } from './calendlyWebhook.controller';
import { CalendlyWebhookGuard } from './calendlyWebhook.guard';
import { CalendlyWebhookService } from './calendlyWebhook.service';
import { ServiceConfig } from 'src/config';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';

@Module({
  controllers: [CalendlyWebhookController],
  imports: [CustomerSupportModule],
  providers: [CalendlyWebhookGuard, CalendlyWebhookService, ServiceConfig],
})
export class CalendlyWebhookModule {}
