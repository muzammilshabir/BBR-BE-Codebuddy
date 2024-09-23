import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscribeNewsletterDto, subscribeNewsletterDtoSchema } from './dto/subscribe-newsletter.dto';
import { Public } from '@bbr/api-core/modules/decorators';
import { NewsletterService } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('/subscribe')
  @ApiOperation({
    summary: 'Subscribe to BBR newsletter',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(subscribeNewsletterDtoSchema, 'body'))
  async subscribe(
    @Body() subscribeNewsletterDto: SubscribeNewsletterDto,
    ) {
    const result = await this.newsletterService.subscribe(subscribeNewsletterDto);
    return ResponseService.buildResponse({ result }, 'Successfully subscribed to BBR newsletter');
  }

  @Post('/unsubscribe')
  @ApiOperation({
    summary: 'Unsubscribe from BBR newsletter',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(subscribeNewsletterDtoSchema, 'body'))
  async unsubscribe(
    @Body() unsubscribeNewsletterDto: SubscribeNewsletterDto,
    ) {
    const result = await this.newsletterService.unsubscribe(unsubscribeNewsletterDto);
    return ResponseService.buildResponse({ result }, 'Successfully unsubscribed from BBR newsletter');
  }

  @Get('/test')
  @ApiOperation({
    summary: 'Unsubscribe from BBR newsletter',
  })
  @Public()
  async test(
    ) {
    const a = await this.newsletterService.test();
    return ResponseService.buildResponse({ a }, 'Successfully unsubscribed from BBR newsletter');
  }
}
