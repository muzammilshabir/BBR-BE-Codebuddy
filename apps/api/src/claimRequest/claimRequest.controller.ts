import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClaimRequestService } from './claimRequest.service';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  CreateClaimRequestDto,
  createClaimRequestSchema,
  CreateClaimResidenceForDeveloperWithMatchingDomainDto,
  createClaimResidenceForDeveloperWithMatchingDomainDtoSchema,
} from './dto/createClaimRequest.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { Public } from '@bbr/api-core/modules/decorators';

@ApiTags('ClaimRequest')
@Controller('claim-request')
export class ClaimRequestController {
  constructor(private readonly claimRequestService: ClaimRequestService) {}

  @Post('developer/different-domain')
  @ApiOperation({
    summary: 'Claim a residence or unit by an existing developer with different domain',
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

  @Post('developer/same-domain')
  @ApiOperation({
    summary: 'Claim a residence or unit by an existing developer with same domain',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(
    new JoiValidationPipe(createClaimResidenceForDeveloperWithMatchingDomainDtoSchema, 'body')
  )
  async claimResidenceForDeveloperWithMatchingDomain(
    @Body() createClaimRequestDto: CreateClaimResidenceForDeveloperWithMatchingDomainDto,
    @GetCurrentUserId() userId: string
  ) {
    const claimRequest =
      await this.claimRequestService.claimResidenceForDeveloperWithMatchingDomain(
        createClaimRequestDto,
        userId
      );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request submitted successfully');
  }

  @Post('guest/same-domain')
  @ApiOperation({
    summary: 'Claim a residence or unit by guest user with same domain',
  })
  @Public()
  @UsePipes(
    new JoiValidationPipe(createClaimResidenceForDeveloperWithMatchingDomainDtoSchema, 'body')
  )
  async claimResidenceForGuestWithMatchingDomain(
    @Body() createClaimRequestDto: CreateClaimResidenceForDeveloperWithMatchingDomainDto
  ) {
    const claimRequest =
      await this.claimRequestService.claimResidenceForGuestWithMatchingDomain(
        createClaimRequestDto
      );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request submitted successfully');
  }
}
