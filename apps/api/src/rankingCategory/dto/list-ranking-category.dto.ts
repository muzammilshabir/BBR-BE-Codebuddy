import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';
import { CategoryType } from '../enum/category-type.enum';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export const rankingCategorySchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  status: Joi.string()
    .valid(...Object.values(RankingCategoryStatus))
    .optional(),
  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .optional(),
  createdById: Joi.string().custom(joiObjectIdValidator('createdById')).optional(),
  countryId: Joi.string().optional(),
  stateId: Joi.string().custom(joiObjectIdValidator('stateId')).optional(),
  cityId: Joi.string().optional(),
  locationId: Joi.string().custom(joiObjectIdValidator('locationId')).optional(),
  propertyTypeId: Joi.string().optional(),
  lifestyleId: Joi.string().optional(),
  geoGraphyId: Joi.string().optional(),
  brandId: Joi.string().optional(),
});

export const popularRankingCategorySchema = PaginationSchema.fork(['sortBy', 'sortOrder'], () =>
  Joi.forbidden()
);

export class RankingCategoryListDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search ranking category',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Ranking category status',
    example: RankingCategoryStatus.ACTIVE,
    required: false,
    enum: RankingCategoryStatus,
  })
  status?: RankingCategoryStatus;

  @ApiProperty({
    example: CategoryType.CITY,
    enum: CategoryType,
    description: 'Ranking category type',
    required: false,
  })
  categoryType?: CategoryType;

  @ApiProperty({
    description: 'Filter by created by ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  createdById?: string;

  @ApiProperty({
    description: 'Filter by country ID',
    example: '60b6c0f53b5a5c1f88d25a1c',
    required: false,
    type: String,
  })
  countryId?: string;

  @ApiProperty({
    description: 'Filter by State ID',
    example: '60b6c0f53b5a5c1f88d25a1c',
    required: false,
    type: String,
  })
  stateId?: string;

  @ApiProperty({
    description: 'Filter by city ID',
    example: '60b6c0f53b5a5c1f88d25a1d',
    required: false,
    type: String,
  })
  cityId?: string;

  @ApiProperty({
    description: 'Filter by location ID',
    example: '60b6c0f53b5a5c1f88d25a1e',
    required: false,
    type: String,
  })
  locationId?: string;

  @ApiProperty({
    description: 'Filter by property type ID',
    example: '60b6c0f53b5a5c1f88d25a1f',
    required: false,
    type: String,
  })
  propertyTypeId?: string;

  @ApiProperty({
    description: 'Filter by lifestyle ID',
    example: '60b6c0f53b5a5c1f88d25a1g',
    required: false,
    type: String,
  })
  lifestyleId?: string;

  @ApiProperty({
    description: 'Filter by geoGraphy ID',
    example: '60b6c0f53b5a5c1f88d25a1g',
    required: false,
    type: String,
  })
  geoGraphyId?: string;

  @ApiProperty({
    description: 'Filter by brand ID',
    example: '60d7fe6f9eb1f24a04d65637',
    required: false,
    type: String,
  })
  brandId?: string;
}

export class PopularRankingCategoryListDto extends OmitType(ListPropsDto, [
  'sortBy',
  'sortOrder',
] as const) {}

export class PublicRankingCategoryListDto extends OmitType(RankingCategoryListDto, [
  'status',
] as const) {}
