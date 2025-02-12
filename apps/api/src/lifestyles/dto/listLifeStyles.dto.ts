import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listLifeStylesSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  hasRankingCategory: Joi.boolean().optional(),
});

export class ListLifeStylesDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by LifeStyles type',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter lifestyles that have a ranking category',
    example: true,
    required: false,
    type: Boolean,
  })
  hasRankingCategory?: boolean;
}
