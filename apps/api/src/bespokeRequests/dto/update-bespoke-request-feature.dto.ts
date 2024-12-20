import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateBespokeRequestFeatureDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the bespoke',
    required: true,
  })
  planId: Types.ObjectId;

  @ApiProperty({
    type: [Object],
    required: false,
    description: 'Array of features with their details',
    example: [
      { featureName: 'Ranking by City - Top 10 in Athens', monthlyPrice: 250, custom: true },
      { featureName: 'Custom Feature - Social Media Promotion', monthlyPrice: 500, custom: true },
      {
        rankingCategoryId: '60d7fe6f9eb1f24a04d65633',
        monthlyPrice: 500,
        custom: false,
        featureName: 'Custom Feature - Social Media Promotion',
      },
    ],
  })
  features?: Array<{
    featureName: string;
    monthlyPrice: number;
    custom: boolean;
    rankingCategoryId?: Types.ObjectId;
  }>;
}

export const updateBespokeRequestFeatureSchema = Joi.object({
  planId: Joi.string().custom(joiObjectIdValidator('planId')).required(),
  features: Joi.array()
    .items(
      Joi.object({
        featureName: Joi.string().required().messages({
          'any.required': 'Feature name is required',
          'string.base': 'Feature name must be a string',
        }),
        monthlyPrice: Joi.number().required().messages({
          'any.required': 'Monthly price is required',
          'number.base': 'Monthly price must be a number',
        }),
        custom: Joi.boolean().required().messages({
          'any.required': 'Custom field is required',
          'boolean.base': 'Custom must be a boolean',
        }),
        rankingCategoryId: Joi.string()
          .optional()
          .custom(joiObjectIdValidator('rankingCategoryId')),
      })
    )
    .optional(),
}).min(1);
