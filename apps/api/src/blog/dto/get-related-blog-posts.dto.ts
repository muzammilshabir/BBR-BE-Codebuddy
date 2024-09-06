import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetRelatedBlogPostsDto {
  @ApiProperty({
    description: 'Get related posts by Post id',
    example: '66acda8b857c576159b74d12',
    required: true,
  })
  postId: Types.ObjectId;
}

export const getRelatedBlogPostsSchema = Joi.object({
  postId: Joi.string().custom(joiObjectIdValidator('postId')).required(),
});
