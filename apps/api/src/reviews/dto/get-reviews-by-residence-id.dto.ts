import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetReviewsByResidenceIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e8c2',
    description: 'ID of the Residence for Reviews',
    required: true,
  })
  residenceId: string;
}

export const getReviewsByResidenceIdSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
});
