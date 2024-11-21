import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Body, Post, UsePipes } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GuestApplyRankingDto, guestApplyRankingSchema } from './guast-apply-ranking.dto';
import { GuestApplyRankingService } from './guast-apply-ranking.service';
@ApiTags('Guest Apply Ranking')
@Controller('guest-apply-ranking')
export class GuestApplyRankingController {
  constructor(private readonly guestApplyRankingService: GuestApplyRankingService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest Apply Ranking',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(guestApplyRankingSchema, 'body'))
  async guestApplyRanking(@Body() body: GuestApplyRankingDto) {
    const rankingCategory = await this.guestApplyRankingService.findRankingCategory(body);
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category retrieved successfully'
    );
  }
}
