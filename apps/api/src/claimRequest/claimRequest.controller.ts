import { Body, Controller, Get, Param, Patch, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClaimRequestService } from './claimRequest.service';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  CreateClaimRequestDto,
  createClaimRequestSchema,
  CreateClaimResidenceWithMatchingDomainDto,
  createClaimResidenceWithMatchingDomainSchema,
} from './dto/createClaimRequest.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { Public } from '@bbr/api-core/modules/decorators';
import { GetClaimRequestByIdDto, getClaimRequestIdSchema } from './dto/getClaimRequest.dto';
import { RejectClaimRequestDto, rejectClaimRequestSchema } from './dto/rejectClaimRequest.dto';

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
  @UsePipes(new JoiValidationPipe(createClaimResidenceWithMatchingDomainSchema, 'body'))
  async claimResidenceForDeveloperWithMatchingDomain(
    @Body() createClaimRequestDto: CreateClaimResidenceWithMatchingDomainDto,
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
  @UsePipes(new JoiValidationPipe(createClaimResidenceWithMatchingDomainSchema, 'body'))
  async claimResidenceForGuestWithMatchingDomain(
    @Body() createClaimRequestDto: CreateClaimResidenceWithMatchingDomainDto
  ) {
    const claimRequest =
      await this.claimRequestService.claimResidenceForGuestWithMatchingDomain(
        createClaimRequestDto
      );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request submitted successfully');
  }

  @Post('guest/different-domain')
  @ApiOperation({
    summary: 'Claim a residence or unit by guest user with different domain',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createClaimRequestSchema, 'body'))
  async claimResidenceForGuestWithDifferentDomain(
    @Body() createClaimRequestDto: CreateClaimRequestDto
  ) {
    const claimRequest =
      await this.claimRequestService.claimResidenceForGuestWithDifferentDomain(
        createClaimRequestDto
      );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request submitted successfully');
  }

  @Post('guest/associate-claims')
  @ApiOperation({
    summary: 'Associate claims by guest with developer account',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async associateClaims(@GetCurrentUserId() userId: string) {
    const claimRequest = await this.claimRequestService.associateClaims(userId);
    return ResponseService.buildResponse({ claimRequest }, 'Claim request Associated successfully');
  }

  @Patch('approve-request/:id')
  @ApiOperation({
    summary: 'Approve claim request created by Developer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getClaimRequestIdSchema, 'param'))
  async approveClaimRequest(@Param() getClaimRequestByIdDto: GetClaimRequestByIdDto) {
    const claimRequest = await this.claimRequestService.approveClaimRequest(getClaimRequestByIdDto);
    return ResponseService.buildResponse({ claimRequest }, 'Claim request approved successfully');
  }

  @Patch('reject-request/:id')
  @ApiOperation({
    summary: 'Reject claim request created by Developer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getClaimRequestIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(rejectClaimRequestSchema, 'body'))
  async rejectClaimRequest(
    @Param() getClaimRequestByIdDto: GetClaimRequestByIdDto,
    @Body() rejectClaimRequestDto: RejectClaimRequestDto
  ) {
    const claimRequest = await this.claimRequestService.rejectClaimRequest(
      getClaimRequestByIdDto,
      rejectClaimRequestDto
    );
    return ResponseService.buildResponse({ claimRequest }, 'Claim request rejected successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get claim request by id',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(getClaimRequestIdSchema, 'param'))
  async getClaimRequestById(@Param() getClaimRequestByIdDto: GetClaimRequestByIdDto) {
    const claimRequest = await this.claimRequestService.getClaimRequestById(getClaimRequestByIdDto);
    return ResponseService.buildResponse({ claimRequest }, 'Claim request fetched successfully');
  }
}
