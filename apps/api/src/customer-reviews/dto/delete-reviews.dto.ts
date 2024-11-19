import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export class DeleteReviewsDto {
  @ApiProperty({
    example: ['66acda8b857c576159b74da2', '66acda8b857c576159b75da5'],
    required: true,
  })
  reviewIds: Types.ObjectId[];
}

export const deleteReviewsDtoSchema = Joi.object({
  reviewIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('reviewIds')).required())
    .required(),
});
