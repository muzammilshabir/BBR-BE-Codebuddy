import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClaimRequestService } from './claimRequest.service';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { CreateClaimRequestDto, createClaimRequestSchema } from './dto/createClaimRequest.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';

@ApiTags('ClaimRequest')
@Controller('claim-request')
export class ClaimRequestController {
  constructor(private readonly claimRequestService: ClaimRequestService) {}

  @Post()
  @ApiOperation({
    summary: 'Claim a residence or unit by an existing developer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createClaimRequestSchema, 'body'))
  async claimResidence(
    @Body() createClaimRequestDto: CreateClaimRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const claimRequest = await this.claimRequestService.createClaimResidence(
      createClaimRequestDto,
      userId
    );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request submitted successfully');
  }
}
