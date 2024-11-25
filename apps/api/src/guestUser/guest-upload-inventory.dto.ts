import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import {
  guestApplyRankingSchema,
  ResidenceDetailsDto,
  UserDetailsDto,
} from './guast-apply-ranking.dto';

export const guestUploadInventorySchema = guestApplyRankingSchema
  .append({
    subscriptionPlanId: Joi.string().custom(joiObjectIdValidator('subscriptionPlanId')).required(),
  })
  .fork(['rankingCategoryIds'], (schema) => schema.forbidden());

export class GuestUploadInventoryDto {
  @ApiProperty({
    description: 'Residence details',
    type: ResidenceDetailsDto,
  })
  residenceDetails: ResidenceDetailsDto;

  @ApiProperty({
    description: 'User details',
    type: UserDetailsDto,
  })
  userDetails: UserDetailsDto;

  @ApiProperty({
    description: 'Stripe payment method token ID',
    type: String,
  })
  stripePmTokenId: string;

  @ApiProperty({
    description: 'Subscription plan ID',
    type: String,
    required: true,
  })
  subscriptionPlanId: string;
}
