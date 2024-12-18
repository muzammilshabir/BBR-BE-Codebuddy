import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { CalendlyDetails } from '../../customer-support/type/customer-support.type';
import { calendlyDetailsSchema } from '../../customer-support/dto/create-customer-support.dto';

export class CreateBespokeRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence',
    required: false,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    type: CalendlyDetails,
    required: true,
    description: 'Calendly meeting details',
  })
  calendlyDetails: CalendlyDetails;
}

export const createBespokeRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  calendlyDetails: calendlyDetailsSchema.required(),
});
