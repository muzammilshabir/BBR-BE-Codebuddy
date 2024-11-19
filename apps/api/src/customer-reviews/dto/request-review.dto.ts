import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class RequestReviewDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a122a', required: true, type: String })
  residenceId: Types.ObjectId;

  @ApiProperty({
    example: ['buyer1@example.com', 'buyer2@example.com'],
    required: true,
    type: [String],
    isArray: true,
  })
  emails: string[];
}

export const requestReviewDtoSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  emails: Joi.array().items(Joi.string().email()).required(),
});
