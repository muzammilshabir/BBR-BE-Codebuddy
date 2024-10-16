import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RankingCategoryStatus } from '../../rankingCategory/enum/rankingCategory-status.enum';
import { CategoryType } from '../../rankingCategory/enum/category-type.enum';

export class ListRankingCategoryDraftDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ranking category name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: RankingCategoryStatus.ACTIVE,
    enum: RankingCategoryStatus,
    description: 'The status of the ranking category',
    required: false,
  })
  status?: RankingCategoryStatus;

  @ApiProperty({
    example: CategoryType.CITY,
    enum: CategoryType,
    description: 'Ranking category type',
    required: false,
  })
  categoryType?: CategoryType;
}

export const listRankingCategoryDraftSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(RankingCategoryStatus))
    .optional(),
  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .optional(),
});
