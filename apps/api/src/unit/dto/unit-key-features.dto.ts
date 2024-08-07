import { ApiProperty } from '@nestjs/swagger';
import { Recurrence, ServiceType } from '../enum/unit-enum';
import * as Joi from 'joi';

export class ResidenceServiceDto {
  @ApiProperty({
    example: ServiceType.COOKING,
    enum: ServiceType,
  })
  serviceType: ServiceType;

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
        serviceType: ServiceType.COOKING,
        amount: 100,
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
        serviceType: Joi.string()
          .valid(...Object.values(ServiceType))
          .required(),
        amount: Joi.number().required(),
        recurrence: Joi.string()
          .valid(...Object.values(Recurrence))
          .required(),
      }).required()
    )
    .optional(),
});
