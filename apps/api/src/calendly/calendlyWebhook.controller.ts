import { Public } from '@bbr/api-core/modules/decorators';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendlyWebhookService } from './calendlyWebhook.service';
import { CalendlyWebhookGuard } from './calendlyWebhook.guard';

@ApiTags('Calendly Webhook')
@Controller('calendly-webhook')
export class CalendlyWebhookController {
  constructor(private readonly calendlyWebhookService: CalendlyWebhookService) {}

  @Post()
  @ApiOperation({
    summary: 'Calendly webhook',
  })
  @UseGuards(CalendlyWebhookGuard)
  @Public()
  async list(@Body() body: any) {
    await this.calendlyWebhookService.handleWebhook(body);
    return true;
  }
}
