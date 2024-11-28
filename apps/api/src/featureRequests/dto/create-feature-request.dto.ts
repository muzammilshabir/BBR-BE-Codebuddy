import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { FeatureRequestStatus } from '../enum/feature-request-status';

export class CreateFeatureRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence to be featured',
    required: true
  })
  residenceId: Types.ObjectId;

  @ApiProperty({ required: false })
  status?: FeatureRequestStatus;

  @ApiProperty({ example: '1234567890', description: 'Transaction ID', required: false })
  transactionId?: string;
}

export const createFeatureRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  status: Joi.string().valid(...Object.values(FeatureRequestStatus)).optional(),
  transactionId: Joi.string().optional(),
}); 