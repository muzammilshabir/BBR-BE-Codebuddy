import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { ListAmenitiesDto, listAmenitiesSchema } from './dto/listresidences.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  @ApiOperation({
    summary: 'List all amenities',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listAmenitiesSchema, 'query'))
  async list(@Query() listAmenitiesDto: ListAmenitiesDto) {
    const data = await this.uploadService.findAll(listAmenitiesDto);
    return ResponseService.buildResponse(data);
  }

}