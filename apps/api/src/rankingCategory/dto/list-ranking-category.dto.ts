import { ApiProperty } from '@nestjs/swagger';
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
  createdById: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
});

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
}
