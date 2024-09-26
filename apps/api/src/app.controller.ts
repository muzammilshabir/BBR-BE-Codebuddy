import { Controller, Get } from '@nestjs/common';
import { Public } from '@bbr/api-core/modules/decorators';

@Controller()
export class AppController {
  constructor() {
    //
  }

  @Get('health-check')
  @Public()
  healthCheck(): string {
    return 'OK';
  }
}