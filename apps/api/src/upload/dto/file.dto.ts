import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
export class FilesUploadDto {
  @ApiProperty({
    description: 'Maximum file size allowed is 512MB for each file.',
    type: 'array',
    items: { type: 'string', format: 'binary', required: ['files'] },
    required: true,
  })
  files: any[];
}

export class FilesDownloadDto {
  @ApiProperty({
    description: 'The public URL of the image to download',
    example: 'https://example.com/image.jpg',
    type: String,
    required: true,
  })
  publicUrl: string;
}

export const fileDownloadSchema = Joi.object({
  publicUrl: Joi.string().uri().required().description('The public URL of the image to download'),
});
