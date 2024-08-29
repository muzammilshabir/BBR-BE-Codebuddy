import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { MetadataType } from '../enum/metadataType-enum';
export class FilesUploadDto {
  @ApiProperty({
    description: 'Maximum file size allowed is 512MB for each file.',
    type: 'array',
    items: { type: 'string', format: 'binary', required: ['files'] },
    required: true,
  })
  files: any[];

  @ApiProperty({
    description: 'Optional metadata for the file upload.',
    type: 'object',
    properties: {
      referenceId: { type: 'string', format: 'uuid', example: '605c72ef7c39f43b30a9d5d9' },
      referenceType: { type: 'string', enum: Object.values(MetadataType) },
    },
    required: false,
    example: {
      referenceId: '605c72ef7c39f43b30a9d5d9',
      referenceType: MetadataType.RESIDENCE,
    },
  })
  metadata?: {
    referenceId?: string;
    referenceType?: MetadataType;
  };
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
