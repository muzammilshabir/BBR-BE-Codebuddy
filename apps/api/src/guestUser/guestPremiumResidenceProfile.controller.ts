import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GuestUserService } from './guast-user.service';
import { GuestPremiumResidenceProfileDto } from './guest-request-premium-residence-profile.dto';
import { guestPremiumResidenceProfileSchema } from './guest-request-premium-residence-profile.dto';

@ApiTags('Guest Premium Residence Profile')
@Controller('guest-premium-residence-profile')
export class GuestPremiumResidenceProfileController {
  constructor(private readonly guestPremiumResidenceProfileService: GuestUserService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest Premium Residence Profile',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(guestPremiumResidenceProfileSchema, 'body'))
  async guestPremiumResidenceProfile(@Body() body: GuestPremiumResidenceProfileDto) {
    const resp =
      await this.guestPremiumResidenceProfileService.requestPremiumResidenceProfile(body);
    return ResponseService.buildResponse(resp, 'Premium residence profile requested successfully');
  }
}
