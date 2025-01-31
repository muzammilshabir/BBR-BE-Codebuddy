import { Controller, Post, Query } from '@nestjs/common';
import { BulkImageConversionService } from './bulk-image-conversion.service';
import { Public } from '@bbr/api-core/modules/decorators';
import { ApiQuery } from '@nestjs/swagger';

@Controller('jobs')
export class JobsController {
  constructor(private readonly bulkImageConversionService: BulkImageConversionService) {}

  @Post('enqueue-image-processing')
  @Public()
  @ApiQuery({
    name: 'prefix',
    required: false,
    type: String,
    description: 'Optional prefix to filter images for processing',
  })
  async triggerBulkConvertImagesJob(@Query('prefix') prefix?: string) {
    console.log(`Enqueueing image processing job with prefix: ${prefix || 'none'}`);
    await this.bulkImageConversionService.enqueueImageProcessingJobs(prefix);
    return { message: 'Image processing jobs enqueued.' };
  }
}
