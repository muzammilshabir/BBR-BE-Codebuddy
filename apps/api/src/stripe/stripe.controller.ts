import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import {  ApiOperation, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { StripeWebhookService } from './stripe-webhook.service';

@ApiTags('Stripe')
@Controller('stripe-webhooks-private')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}

 
  @Post('/webhook')
  @ApiOperation({
    summary: 'Stripe Events Webhook',
  })
  @Public()
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const result = await this.stripeWebhookService.handleWebhooks(req);
    return ResponseService.buildResponse({ result }, '');
  }
}
