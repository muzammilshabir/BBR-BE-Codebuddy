import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { isValidObjectId } from '@bbr/api-core/modules/custome-validations/custome-validations'; 

export const getSinglePostSchema = Joi.object({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.message({ custom: 'Invalid ObjectId' });
      }
      return value;
    })
    .required(),
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
