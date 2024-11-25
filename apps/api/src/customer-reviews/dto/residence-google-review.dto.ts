import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetReviewByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Review',
    required: true,
  })
  id: string;
}

export const getReviewByIdSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
});
