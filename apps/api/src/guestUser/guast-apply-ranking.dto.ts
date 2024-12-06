import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { passwordSchema } from '@bbr/api-core/modules/dto/common.dto';
import { UserPhone } from 'src/users/types/user.type';

export const guestApplyRankingSchema = Joi.object({
  residenceDetails: Joi.object({
    name: Joi.string().required(),
    countryId: Joi.string().custom(joiObjectIdValidator('countryId')).required(),
    cityId: Joi.string().custom(joiObjectIdValidator('cityId')).required(),
    zipCode: Joi.string().required(),
    address1: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
    placeId: Joi.string().required(),
  }),
  rankingCategoryIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('rankingCategoryId')))
    .required(),
  userDetails: Joi.object({
    fullName: Joi.string().required(),
    password: passwordSchema.required(),
    email: Joi.string().email().required(),
    phone: Joi.object({
      countryCode: Joi.string().required(),
      number: Joi.string().required(),
    }).optional(),
  }),
  stripePmTokenId: Joi.string().required(),
});

export class Location {
  @ApiProperty({
    description: 'Latitude',
    type: Number,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude',
    type: Number,
  })
  lng: number;
}

export class ResidenceDetailsDto {
  @ApiProperty({
    description: 'Residence name',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Country ID',
    type: String,
  })
  countryId: string;

  @ApiProperty({
    description: 'City ID',
    type: String,
  })
  cityId: string;

  @ApiProperty({
    description: 'Zip code',
    type: String,
  })
  zipCode: string;

  @ApiProperty({
    description: 'Address line 1',
    type: String,
  })
  address1: string;

  @ApiProperty({
    description: 'Location',
    type: Location,
  })
  location: Location;

  @ApiProperty({
    description: 'Place ID',
    type: String,
  })
  placeId: string;
}

export class UserDetailsDto {
  @ApiProperty({
    description: 'Full name',
    type: String,
  })
  fullName: string;

  @ApiProperty({
    description: 'Password',
    type: String,
  })
  password: string;

  @ApiProperty({
    description: 'Email',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Phone',
    type: UserPhone,
    required: false,
  })
  phone?: UserPhone;
}

export class GuestApplyRankingDto {
  @ApiProperty({
    description: 'Residence details',
    type: ResidenceDetailsDto,
  })
  residenceDetails: ResidenceDetailsDto;

  @ApiProperty({
    description: 'Ranking category IDs',
    type: [String],
  })
  rankingCategoryIds: string[];

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
}
