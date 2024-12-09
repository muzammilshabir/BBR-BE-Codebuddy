import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateFeatureRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence to be featured',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    required: true,
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'Plan ID',
    type: Types.ObjectId,
  })
  planId: Types.ObjectId;
}

export const createFeatureRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  planId: Joi.string().custom(joiObjectIdValidator('planId')).required(),
});
