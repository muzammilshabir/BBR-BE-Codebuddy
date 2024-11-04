import { ApiProperty, PartialType } from '@nestjs/swagger';
import * as Joi from 'joi';
import { CategoryType } from '../enum/category-type.enum';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

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
    description: 'The title of the ranking category',
    example: 'Top 10 Best Cities to Live',
    required: true,
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'The description of the ranking category',
    example: 'This is top 10 Best Cities to Live',
    required: true,
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'The category type for ranking',
    example: CategoryType.CITY,
    required: true,
    enum: CategoryType,
  })
  categoryType: CategoryType;

  @ApiProperty({
    description: 'The category status',
    example: RankingCategoryStatus.INACTIVE,
    required: false,
    enum: [RankingCategoryStatus.ACTIVE, RankingCategoryStatus.INACTIVE],
  })
  status: RankingCategoryStatus.ACTIVE | RankingCategoryStatus.INACTIVE;

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

  @ApiProperty({
    description: 'ID for Geography-based category type',
    example: '60d7fe6f9eb1f24a04d65633',
    required: false,
  })
  locationId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID for Country-based category type',
    example: '60d7fe6f9eb1f24a04d65634',
    required: false,
  })
  countryId?: string;

  @ApiProperty({
    description: 'ID for City-based category type',
    example: '60d7fe6f9eb1f24a04d65635',
    required: false,
  })
  cityId?: string;

  @ApiProperty({
    description: 'ID for Lifestyle-based category type',
    example: '60d7fe6f9eb1f24a04d65636',
    required: false,
  })
  lifeStyleId?: string;

  @ApiProperty({
    description: 'ID for Property Type-based category type',
    example: '60d7fe6f9eb1f24a04d65637',
    required: false,
  })
  propertyTypeId?: string;
}

export const createRankingCategorySchema = Joi.object({
  title: Joi.string().required().max(100).trim(),
  description: Joi.string().optional(),
  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .required(),
  status: Joi.string()
    .valid(RankingCategoryStatus.ACTIVE, RankingCategoryStatus.INACTIVE)
    .optional(),
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

  locationId: Joi.string()
    .custom(joiObjectIdValidator('locationId'))
    .when('categoryType', { is: CategoryType.GEOGRAPHY, then: Joi.required() }),

  countryId: Joi.string()
    .custom(joiObjectIdValidator('countryId'))
    .when('categoryType', { is: CategoryType.COUNTRY, then: Joi.required() }),

  cityId: Joi.string()
    .custom(joiObjectIdValidator('cityId'))
    .when('categoryType', { is: CategoryType.CITY, then: Joi.required() }),

  lifeStyleId: Joi.string()
    .custom(joiObjectIdValidator('lifeStyleId'))
    .when('categoryType', { is: CategoryType.LIFESTYLE, then: Joi.required() }),

  propertyTypeId: Joi.string()
    .custom(joiObjectIdValidator('propertyTypeId'))
    .when('categoryType', { is: CategoryType.PROPERTY_TYPE, then: Joi.required() }),
});
