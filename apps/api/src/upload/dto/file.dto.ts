import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listAmenitiesSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListAmenitiesDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Amenities type',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export class FilesUploadDto {
  @ApiProperty({
    description: 'Maximum file size allowed is 512MB for each file.',
    type: 'array',
    items: { type: 'string', format: 'binary', required: ['files'] },
    required: true,
  })
  files: any[];
}