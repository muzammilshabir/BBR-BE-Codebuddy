import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { SubscriptionItem } from './create-subscription.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateSubscriptionItem extends SubscriptionItem {
  @ApiProperty({
    example: 'lfj23lejd',
    required: true,
  })
  id: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ required: true, type: UpdateSubscriptionItem, isArray: true })
  subscriptionItems: UpdateSubscriptionItem[];
}

export const UpdateSubscriptionDtoSchema = Joi.object({
  subscriptionItems: Joi.array().items(Joi.object({
    id: Joi.string().required(),
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
