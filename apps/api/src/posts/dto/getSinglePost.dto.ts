import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const getSinglePostSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
});

export class GetSinglePostDto {
  @ApiProperty({
    description: 'ID of Post',
    example: '60d0fe4f5311236168a109ca',
    required: true,
    type: String,
  })
  id: string;
}
