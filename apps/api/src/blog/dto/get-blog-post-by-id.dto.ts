import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetBlogPostByIdDto {
  @ApiProperty({
    description: 'Get post by id',
    example: '66acda8b857c576159b74d12',
    required: true,
  })
  postId: string;
}

export const getBlogPostByIdSchema = Joi.object({
  postId: Joi.string().custom(joiObjectIdValidator('postId')).required(),
});
