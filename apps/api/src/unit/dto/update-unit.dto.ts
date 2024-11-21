import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateUnitDto {
  @ApiProperty({
    example: 'Updated Unit A',
    required: false,
  })
  unitName?: string;

  @ApiProperty({
    example: {
      unitNumber: '102',
      generalUnitSpaceSqFt: 1300,
      floor: 2,
    },
    required: false,
  })
  specs?: {
    unitNumber?: string;
    generalUnitSpaceSqFt?: number;
    floor?: number;
  };

  @ApiProperty({
    example: 600000,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    example: {
      exclusiveUnitPrice: 550000,
      OfferStartDate: '2024-09-01T00:00:00Z',
      OfferEndDate: '2024-09-30T00:00:00Z',
    },
    required: false,
  })
  exclusiveOffer?: {
    exclusiveUnitPrice?: number;
    OfferStartDate?: Date;
    OfferEndDate?: Date;
  };

  @ApiProperty({
    example: [
      {
        roomTypeId: '66acda8b857c576159b74da4',
        unit: 1,
      },
      {
        unit: 2,
        roomName: 'Guest Room',
      },
    ],
    required: false,
  })
  rooms?: {
    roomTypeId: Types.ObjectId;
    unit: number;
    roomName?: string;
  }[];

  @ApiProperty({
    example: {
      subTitle: 'Updated Spacious Apartment',
      description: 'An updated description with more details.',
    },
    required: false,
  })
  briefOverview?: {
    subTitle?: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Set to true if ExclusiveOffer',
    example: false,
    required: false,
    default: false,
  })
  isExclusiveOffer?: boolean;
}

export const updateUnitSchema = Joi.object({
  unitName: Joi.string().optional(),
  specs: Joi.object({
    unitNumber: Joi.string().optional(),
    generalUnitSpaceSqFt: Joi.number().optional(),
    floor: Joi.number().optional(),
  }).optional(),
  unitPrice: Joi.number().optional(),
  exclusiveOffer: Joi.object({
    exclusiveUnitPrice: Joi.number().optional(),
    OfferStartDate: Joi.date().optional(),
    OfferEndDate: Joi.date().optional(),
  }).optional(),
  rooms: Joi.array()
    .items(
      Joi.object({
        roomTypeId: Joi.string().custom(joiObjectIdValidator('roomTypeId')).optional(),
        unit: Joi.number().optional(),
        roomName: Joi.string().optional(),
      })
    )
    .optional(),
  briefOverview: Joi.object({
    subTitle: Joi.string().optional(),
    description: Joi.string().optional(),
  }).optional(),
  isExclusiveOffer: Joi.boolean().optional(),
});
