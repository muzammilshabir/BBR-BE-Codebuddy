import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class GetByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID ',
    required: true,
  })
  id: string;
}

export const getIdSchema = Joi.object({ id: Joi.string().required() });
