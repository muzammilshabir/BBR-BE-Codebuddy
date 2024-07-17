import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../decorators';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { BadRequestException, NotFoundException, UnauthorizedException,ValidationException } from '../exceptions/index';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  constructor() {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
  })
  @Public()
  async healthCheck() {
    return { status: 'OK' };
  }

}
