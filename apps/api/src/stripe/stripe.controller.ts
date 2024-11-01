import { Public } from '@bbr/api-core/modules/decorators';
import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { StripeWebhookService } from './stripe-webhook.service';

@ApiTags('Stripe')
@Controller('stripe-webhooks-private')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly stripeWebhookService: StripeWebhookService
  ) {}

  @Post('/webhook')
  @ApiOperation({
    summary: 'Stripe Events Webhook',
  })
  @Public()
  async webhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    return this.stripeWebhookService.handleWebhooks(req, res);
  }
}
