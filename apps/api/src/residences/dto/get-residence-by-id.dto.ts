import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetResidenceByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Residence',
    required: true,
  })
  id: string;
}

export const getResidenceByIdSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
});

export class GetResidenceByKeyDto {
  @ApiProperty({
    example: '88368f2a-d5db-47d8-a05f-534fab0a0045',
    description: 'Key for the Residence',
    required: true,
  })
  key: string;
}

export const getResidenceByKeySchema = Joi.object({
  key: Joi.string().required()
});
