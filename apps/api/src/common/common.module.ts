import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';

@Module({
  providers: [ResponseService],
  exports: [ResponseService], // Export the service if you need to use it in other modules
})
export class CommonModule {}
