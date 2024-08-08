import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { RoomType } from '../enum/unit-enum';

export class AddUnitDto {
  @ApiProperty({
    example: 'Unit A',
    required: true,
  })
  unitName: string;

  @ApiProperty({
    example: {
      unitNumber: '101',
      generalUnitSpaceSqFt: 1200,
      floor: 1,
    },
    required: false,
  })
  specs?: {
    unitNumber?: string;
    generalUnitSpaceSqFt?: number;
    floor?: number;
  };

  @ApiProperty({
    example: 500000,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    example: {
      exclusiveUnitPrice: 450000,
      OfferStartDate: '2024-08-01T00:00:00Z',
      OfferEndDate: '2024-08-31T00:00:00Z',
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
        roomType: RoomType.BEDROOM,
        unit: 1,
      },
      {
        roomType: RoomType.BATHROOM,
        unit: 2,
      },
    ],
    required: false,
  })
  rooms?: {
    roomType: RoomType;
    unit: number;
  }[];

  @ApiProperty({
    example: {
      subTitle: 'Spacious Apartment',
      description: 'A spacious apartment with modern amenities.',
    },
    required: true,
  })
  briefOverview: {
    subTitle: string;
    description: string;
  };
}

export const addUnitSchema = Joi.object({
  unitName: Joi.string().required(),
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
        roomType: Joi.string()
          .valid(...Object.values(RoomType))
          .optional(),
        unit: Joi.number().optional(),
      })
    )
    .optional(),
  briefOverview: Joi.object({
    subTitle: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});
