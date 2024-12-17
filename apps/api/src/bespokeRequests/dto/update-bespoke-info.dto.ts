import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { CalendlyDetails } from '../../customer-support/type/customer-support.type';
import { calendlyDetailsSchema } from '../../customer-support/dto/create-customer-support.dto';
import { bespokeRequestStatus } from '../enum/bespoke-request-status';

export class UpdateBespokeRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence',
    required: false,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    required: false,
    description: 'Bespoke request status',
    enum: bespokeRequestStatus,
  })
  status?: bespokeRequestStatus;

  @ApiProperty({ required: false, description: 'Bespoke request rejection reason' })
  rejectedReason?: string;

  @ApiProperty({
    type: CalendlyDetails,
    required: false,
    description: 'Calendly meeting details',
  })
  calendlyDetails?: CalendlyDetails;
}

export const updateBespokeRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  calendlyDetails: calendlyDetailsSchema.optional(),
  rejectedReason: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(bespokeRequestStatus))
    .optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.status === bespokeRequestStatus.REJECTED && !value.rejectedReason) {
      return helpers.error('any.custom', {
        message: 'Rejected reason is required when status is REJECTED',
      });
    }
    return value;
  });
