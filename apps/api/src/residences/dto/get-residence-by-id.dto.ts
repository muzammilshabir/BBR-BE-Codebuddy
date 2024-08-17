import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetResidenceByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Residence',
    required: true,
  })
  residenceId: string;
}

export const getResidenceByIdSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
});
