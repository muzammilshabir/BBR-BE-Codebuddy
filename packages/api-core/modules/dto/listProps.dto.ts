import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export enum sortOrder {
  desc = 'desc',
  asc = 'asc',
}

export const PaginationSchema = Joi.object({
  limit: Joi.number().integer().positive().default(10).max(500).required(),
  page: Joi.number().integer().positive().default(1).min(1).required(),
  sortOrder: Joi.string().valid(sortOrder.asc, sortOrder.desc).default('desc'),
  sortBy: Joi.string().default('createdAt'),
});

export class ListPropsDto {
  @ApiProperty({
    example: 1,
    required: false,
    type: Number,
  })
  page: number;

  @ApiProperty({
    example: 10,
    required: false,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    default: 'createdAt',
    required: false,
    examples: {
      createdAt: { value: 'createdAt' },
      updatedAt: { value: 'updatedAt' },
      companyName: {
        value: 'company.name',
        description:
          'dot(.) will work only with nested object. Use appropriate property name, company name is for reference',
      },
    },
    type: String,
  })
  sortBy: string;

  @ApiProperty({
    default: 'desc',
    required: false,
    enum: ['asc', 'desc'],
    type: String,
  })
  sortOrder: 'asc' | 'desc';
}
