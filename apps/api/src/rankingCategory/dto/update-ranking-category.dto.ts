import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  CreateRankingCategoryDto,
  createRankingCategorySchema,
} from './create-ranking-category.dto';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';
import * as Joi from 'joi';

export class UpdateRankingCategoryDto extends PartialType(CreateRankingCategoryDto) {}

export const updateRankingCategorySchema = createRankingCategorySchema.fork(
  Object.keys(createRankingCategorySchema.describe().keys),
  (schema) => schema.optional()
);

export class UpdateRankingCategoryStatusDto {
  @ApiProperty({
    description: 'New status of the residence',
    enum: RankingCategoryStatus,
    example: RankingCategoryStatus.ARCHIVED,
  })
  status: RankingCategoryStatus;
}

export const updateRankingCategoryStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      RankingCategoryStatus.PENDING,
      RankingCategoryStatus.INACTIVE,
      RankingCategoryStatus.ARCHIVED,
      RankingCategoryStatus.DELETED
    )
    .required(),
});
