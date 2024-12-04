import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GuestUserService } from './guast-user.service';
import { GuestRequestVisitDto, guestRequestVisitSchema } from './guest-request-visit.dto';

@ApiTags('Guest Request A Visit')
@Controller('guest-request-a-visit')
export class GuestRequestVisitController {
  constructor(private readonly guestRequestVisitService: GuestUserService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest Request a visit',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(guestRequestVisitSchema, 'body'))
  async guestRequestVisit(@Body() body: GuestRequestVisitDto) {
    await this.guestRequestVisitService.RequestVisit(body);
    return ResponseService.buildResponse({}, 'Request a visit submitted Successfully');
  }
}
