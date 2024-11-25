import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const getCounterSchema = Joi.object({
  prefix: Joi.string().trim().optional(),
});

export class GetCounterDto {
  @ApiProperty({
    title: 'Prefix',
    example: 'ABC',
    required: false,
  })
  prefix?: string;
}
