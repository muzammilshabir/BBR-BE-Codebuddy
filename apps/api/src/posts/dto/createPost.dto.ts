import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const createPostSchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  content: Joi.string().trim().max(100).required(),
});

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'Post title 1',
    required: true,
    type: String,
  })
  title: string;
  @ApiProperty({
    description: 'Post title',
    example: 'Post content 1',
    required: false,
    type: String,
  })
  content?: string;
}
