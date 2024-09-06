import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetPopularBlogPostsDto {
  @ApiProperty({
    description: 'Get Popular Posts by Category',
    example: '66acda8b857c576159b72d52',
    required: true,
  })
  categoryId: Types.ObjectId;
}

export const getPopularBlogPostsSchema = Joi.object({
  categoryId: Joi.string().custom(joiObjectIdValidator('categoryId')).required(),
});
