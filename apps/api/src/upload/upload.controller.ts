import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { fileDownloadSchema, FilesDownloadDto, FilesUploadDto } from './dto/file.dto';
import { Request } from 'express';
import { JoiValidationPipe } from '../../../../packages/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload files',
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

  @ApiOperation({ summary: 'Download image from public URL' })
  @ApiBody({
    description: 'upload public image URL',
    type: FilesDownloadDto,
  })
  @Post('download-image')
  @Public()
  @UsePipes(new JoiValidationPipe(fileDownloadSchema, 'body'))
  async downloadFile(@Body() body: FilesDownloadDto) {
    try {
      const { publicUrl } = body;
      const userId = '60d5f485f7c6a4b2b8e8b5f7'; // Assuming you have user authentication in place

      const files = await this.uploadService.downloadFile(publicUrl, userId);
      return ResponseService.buildResponse({ files });
    } catch (error) {}
  }
}
