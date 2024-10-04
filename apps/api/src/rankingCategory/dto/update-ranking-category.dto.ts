import { PartialType } from '@nestjs/swagger';
import {
  CreateRankingCategoryDto,
  createRankingCategorySchema,
} from './create-ranking-category.dto';

export class UpdateRankingCategoryDto extends PartialType(CreateRankingCategoryDto) {}

export const updateRankingCategorySchema = createRankingCategorySchema.fork(
  Object.keys(createRankingCategorySchema.describe().keys),
  (schema) => schema.optional()
);
