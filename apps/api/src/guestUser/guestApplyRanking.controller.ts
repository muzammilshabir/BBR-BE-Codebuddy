import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GuestApplyRankingDto, guestApplyRankingSchema } from './guast-apply-ranking.dto';
import { GuestUserService } from './guast-user.service';
@ApiTags('Guest Apply Ranking')
@Controller('guest-apply-ranking')
export class GuestApplyRankingController {
  constructor(private readonly guestApplyRankingService: GuestUserService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest Apply Ranking',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(guestApplyRankingSchema, 'body'))
  async guestApplyRanking(@Body() body: GuestApplyRankingDto) {
    const resp = await this.guestApplyRankingService.applyRanking(body);
    return ResponseService.buildResponse(resp, 'Ranking applied successfully');
  }
}
