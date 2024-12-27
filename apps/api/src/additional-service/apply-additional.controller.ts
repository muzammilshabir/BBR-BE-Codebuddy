import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ApplyAdditionalServiceRequestService } from './additional-service.service';
import {
  applyAdditionalServiceRequestSchema,
  ApplyAdditionalServiceRequestDto,
} from './apply-additional-service-request.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';

@ApiTags('Additional Service')
@Controller('additional-service')
export class ApplyAdditionalServiceRequestController {
  constructor(
    private readonly applyAdditionalServiceRequestService: ApplyAdditionalServiceRequestService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Apply Additional Service Request',
  })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(applyAdditionalServiceRequestSchema, 'body'))
  async applyAdditionalServiceRequest(
    @Body() body: ApplyAdditionalServiceRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const paymentIntent = await this.applyAdditionalServiceRequestService.create(body, userId);
    return ResponseService.buildResponse(paymentIntent, 'Payment intent created successfully');
  }
}
