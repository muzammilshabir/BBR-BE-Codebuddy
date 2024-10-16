import { ApiProperty, PartialType } from '@nestjs/swagger';
import * as Joi from 'joi';
import { CategoryType } from '../enum/category-type.enum';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';
import { Types } from 'mongoose';

export class RankingCriteriaDto {
  @ApiProperty({
    description: 'Name of the ranking criteria',
    example: 'Affordability',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Weight of the criteria in the ranking calculation',
    example: 30,
    required: true,
    type: Number,
  })
  weight: number;

  @ApiProperty({
    description: 'Array of score guides for this criteria',
    example: [
      { score: 1, description: 'Very Expensive' },
      { score: 10, description: 'Very Affordable' },
    ],
    required: true,
    type: Array,
  })
  scoreGuide: {
    score: number;
    description: string;
  }[];
}

export class CreateRankingCategoryDto {
  @ApiProperty({
    description: 'The unique title of the ranking category',
    example: 'Top 10 Best Cities to Live',
    required: true,
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'The category type for ranking',
    example: CategoryType.CITY,
    required: true,
    enum: CategoryType,
  })
  categoryType: CategoryType;

  @ApiProperty({
    description: 'List of criteria for ranking',
    example: [
      {
        name: 'Affordability',
        weight: 30,
        scoreGuide: [
          { score: 1, description: 'Very Expensive' },
          { score: 10, description: 'Very Affordable' },
        ],
      },
    ],
    required: true,
    type: [RankingCriteriaDto],
  })
  criteria: RankingCriteriaDto[];

  @ApiProperty({
    description: 'Price for the ranking category',
    example: 150,
    required: true,
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'Price for the ranking category',
    example: 150,
    required: true,
    type: Number,
  })
  residenceLimitation: number;

  @ApiProperty({
    description: 'Array of upload objects',
    example: [{ ImageId: '60d7fe6f9eb1f24a04d65633', type: 'docs' }],
    required: false,
    type: Array,
  })
  upload?: Array<{
    ImageId: Types.ObjectId;
    type?: string;
  }>;
}

export const createRankingCategorySchema = Joi.object({
  title: Joi.string().required().max(100).trim(),
  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .required(),
  criteria: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        weight: Joi.number().required(),
        scoreGuide: Joi.array()
          .items(
            Joi.object({
              score: Joi.number().required(),
              description: Joi.string().required(),
            })
          )
          .required(),
      })
    )
    .required()
    .custom((criteria, helpers) => {
      const totalWeight = criteria.reduce((sum, crit) => sum + crit.weight, 0);
      if (totalWeight !== 100) {
        return helpers.error('any.invalid', {
          message: 'The total weight of criteria must be exactly 100',
        });
      }
      return criteria;
    }),
  price: Joi.number().required(),
  residenceLimitation: Joi.number().required(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        type: Joi.string().optional(),
      })
    )
    .optional(),
});
