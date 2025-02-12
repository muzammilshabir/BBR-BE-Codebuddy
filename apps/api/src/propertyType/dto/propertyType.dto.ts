import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const propertyTypeSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  hasRankingCategory: Joi.boolean().optional(),
});

export class PropertyTypeDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Property Type',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter property types that have a ranking category',
    example: true,
    required: false,
    type: Boolean,
  })
  hasRankingCategory?: boolean;
}
