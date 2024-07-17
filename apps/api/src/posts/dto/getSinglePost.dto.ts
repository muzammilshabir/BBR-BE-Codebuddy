import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const getSinglePostSchema = Joi.object({
  id: Joi.number().positive().min(0).required(),
});

export class GetSinglePostDto {
  @ApiProperty({
    description: 'ID of Post',
    example: 1,
    required: true,
    type: Number,
  })
  id: number;
}
