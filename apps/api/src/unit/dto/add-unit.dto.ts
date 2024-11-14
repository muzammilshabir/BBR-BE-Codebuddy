import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { Types } from 'mongoose';

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
    description: 'Set to true if ExclusiveOffer',
    example: false,
    required: false,
    default: false,
  })
  isExclusiveOffer?: boolean;

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
    roomTypeId?: Types.ObjectId;
    unit: number;
    roomName?: string;
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
        roomTypeId: Joi.string().custom(joiObjectIdValidator('roomTypeId')).optional(),
        unit: Joi.number().optional(),
        roomName: Joi.string().optional(),
      })
    )
    .optional(),
  briefOverview: Joi.object({
    subTitle: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
  isExclusiveOffer: Joi.boolean().optional(),
});

export class FileUploadDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the residence',
    required: true,
  })
  residenceId: string;

  @ApiProperty({
    example: '64c1b5f4e05c12a1f5d8e8a1',
    description: 'ID of the File',
    required: true,
  })
  fileId: string;
}

export const fileUploadSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  fileId: Joi.string().custom(joiObjectIdValidator('fileId')).required(),
});
