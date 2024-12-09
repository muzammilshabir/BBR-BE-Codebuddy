import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchmakingService } from './matchmaking.service';
import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { MatchmakingPreferencesDto, matchmakingPreferencesSchema } from './dto/updatePreferences.dto';

@ApiTags('Matchmaking')
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Get('/get-session')
  @ApiOperation({
    summary: 'Creates a new session',
  })
  @Public()
  async createSession() {
    const result = await this.matchmakingService.createSession();

    return ResponseService.buildResponse(result, 'session created successfully');
  }

  @Post('/:sessionId')
  @ApiOperation({
    summary: 'update the prefrences',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(matchmakingPreferencesSchema, 'body'))
  async updatePreferences(
    @Body() matchmakingPreferencesDto: MatchmakingPreferencesDto,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.matchmakingService.updatePreferences(matchmakingPreferencesDto, sessionId);

    return ResponseService.buildResponse(result, 'preferences updated successfully');
  }
}
