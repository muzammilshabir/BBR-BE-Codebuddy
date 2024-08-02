import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { FilesUploadDto } from './dto/file.dto';
import { Request } from 'express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files to upload',
    type: FilesUploadDto,
  })
  @Post()
  @Public()
  async uploadFile(@Req() req: Request) {
    try {
      const files = await this.uploadService.uploadFile(req);
      return ResponseService.buildResponse({ files });
    } catch (error) {
      this.uploadService.mapError(error);
    }
  }
}
