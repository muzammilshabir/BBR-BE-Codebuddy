import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class SubscriptionItem {
  @ApiProperty({
    example: 'XYZ Heights Residence',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'Listing Subscription for XYZ Heights',
    required: true,
  })
  description: string;

  @ApiProperty({
    example: 'listing',
    required: true,
  })
  type: "listing" | "ranked" | "featured";
  
  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a132a',
    required: true,
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    example: 30000,
    description: "30000 = $300.00 // price is always in cents",
    required: true,
  })
  price: number;

  @ApiProperty({
    example: 1,
    required: true,
  })
  quantity: number;

  @ApiProperty({
    example: 'month',
    required: true,
  })
  interval: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({
    example: 1,
    required: true,
  })
  intervalCount: number;
}

export class CreateSubscriptionDto {
  @ApiProperty({ required: true, type: SubscriptionItem, isArray: true })
  subscriptionItems: SubscriptionItem[];
}

export const createSubscriptionDtoSchema = Joi.object({
  subscriptionItems: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('ranked', 'featured', 'listing').required(),
    residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
    price: Joi.number().required(), 
    quantity: Joi.number().required(),
    interval: Joi.string().valid('day', 'week', 'month', 'year').required(),
    intervalCount: Joi.number().required(),
  })).required(),
});
