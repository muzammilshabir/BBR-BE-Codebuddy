import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { VerificationType } from '../enum/verification-type.enum';

export class CreateBbrVerificationDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence to be verified',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    enum: VerificationType,
    required: true,
    description: 'Type of verification',
  })
  verificationType: VerificationType;

  @ApiProperty({ example: '1234567890', description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ required: true, example: '60d5f485f7c6a4b2b8e8b623', description: 'Plan ID', type: Types.ObjectId })
  planId: Types.ObjectId;
}

export const createBbrVerificationSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  transactionId: Joi.string().optional(),
  verificationType: Joi.string()
    .valid(...Object.values(VerificationType))
    .required(),
  planId: Joi.string().custom(joiObjectIdValidator('planId')).required(),
});
