import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ResidenceDetailsDto, UserDetailsDto } from './guast-apply-ranking.dto';
import { passwordSchema } from '@bbr/api-core/modules/dto/common.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const guestRequestVisitSchema = Joi.object({
  userDetails: Joi.object({
    fullName: Joi.string().required(),
    password: passwordSchema.required(),
    email: Joi.string().email().required(),
    phone: Joi.object({
      countryCode: Joi.string().required(),
      number: Joi.string().required(),
    }).optional(),
  }),
  subscriptionPlanId: Joi.string().custom(joiObjectIdValidator('subscriptionPlanId')).required(),
  residenceDetails: Joi.object({
    name: Joi.string().required(),
    countryId: Joi.string().custom(joiObjectIdValidator('countryId')).required(),
    cityId: Joi.string().custom(joiObjectIdValidator('cityId')).required(),
    zipCode: Joi.string().optional(),
    address1: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
    placeId: Joi.string().required(),
  }),
  stripePmTokenId: Joi.string().required(),
});

export class GuestRequestVisitDto {
  @ApiProperty({
    description: 'User details',
    type: UserDetailsDto,
  })
  userDetails: UserDetailsDto;

  @ApiProperty({
    description: 'Subscription plan ID',
    type: String,
    required: true,
  })
  subscriptionPlanId: string;

  @ApiProperty({
    description: 'Stripe payment method token ID',
    type: String,
  })
  stripePmTokenId: string;

  @ApiProperty({
    description: 'Residence details',
    type: ResidenceDetailsDto,
  })
  residenceDetails: ResidenceDetailsDto;
}
