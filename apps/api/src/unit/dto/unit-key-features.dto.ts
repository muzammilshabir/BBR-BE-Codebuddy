import { ApiProperty } from '@nestjs/swagger';
import { Recurrence } from '../enum/unit-enum';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';
import { Types } from 'mongoose';

export class ResidenceServiceDto {
  @ApiProperty({
    example: '66acda8b857c576159b74da4',
  })
  serviceTypeId: Types.ObjectId;

  @ApiProperty({
    example: 100,
    required: true,
  })
  amount: number;

  @ApiProperty({
    example: Recurrence.DAILY,
    enum: Recurrence,
  })
  recurrence: Recurrence;
}

export class AddUnitKeyFeaturesDto {
  @ApiProperty({
    example: ['Balcony with ocean view', 'Marble walls & floor'],
    required: true,
  })
  features: string[];

  @ApiProperty({
    example: [
      {
        serviceTypeId: '66acda8b857c576159b74da4',
        amount: 3,
        recurrence: Recurrence.DAILY,
      },
    ],
    required: false,
  })
  residenceServices?: ResidenceServiceDto[];
}

export const addUnitKeyFeaturesSchema = Joi.object({
  features: Joi.array().items(Joi.string().required()).required(),
  residenceServices: Joi.array()
    .items(
      Joi.object({
        serviceTypeId: Joi.string().custom(joiObjectIdValidator('serviceTypeId')).optional(),
        amount: Joi.number().required(),
        recurrence: Joi.string()
          .valid(...Object.values(Recurrence))
          .required(),
      }).required()
    )
    .optional(),
});
