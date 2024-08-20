import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';


export class RequestReviewDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a122a', required: true, type: String })
  residenceId: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a182a', required: true, type: String })
  buyerId: Types.ObjectId;
}

export const requestReviewDtoSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  buyerId: Joi.string().custom(joiObjectIdValidator('buyerId')).required(),
});
