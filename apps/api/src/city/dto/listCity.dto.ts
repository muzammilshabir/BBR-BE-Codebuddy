import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const listCitySchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  countryId: Joi.string().custom(joiObjectIdValidator('countryId')).optional(),
  hasRankingCategory: Joi.boolean().optional(), // ✅ Added validation for hasRankingCategory
});

export class ListCityDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by City',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Country ID',
    example: '66acda8b857c576159b74da4',
    required: false,
    type: String,
  })
  countryId?: string;

  @ApiProperty({
    description: 'Filter cities that have a ranking category',
    example: true,
    required: false,
    type: Boolean,
  })
  hasRankingCategory?: boolean;
}
