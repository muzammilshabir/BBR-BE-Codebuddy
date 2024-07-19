import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const getSinglePostSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
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
