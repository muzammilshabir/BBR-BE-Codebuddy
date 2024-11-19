import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import {
  ListPropsDto,
  PaginationSchema,
} from '../../../../../packages/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export enum RatingSortType {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  ALL = 'all',
}

// DTO
export class ListReviewsDto extends ListPropsDto {
  @ApiProperty({
    enum: RatingSortType,
    description: 'Sort by rating',
    required: false,
  })
  ratingSort?: RatingSortType;

  @ApiProperty({
    description: 'Filter by developer IDs',
    type: [String],
    required: false,
  })
  developerIds?: string[];

  @ApiProperty({
    description: 'Search by review text',
    required: false,
  })
  search?: string;
}

// Schema - separate from the DTO
export const listReviewsSchema = PaginationSchema.concat(
  Joi.object({
    ratingSort: Joi.string()
      .valid(...Object.values(RatingSortType))
      .optional(),
    developerIds: Joi.array()
      .items(Joi.string().custom(joiObjectIdValidator('developer')))
      .optional(),
    search: Joi.string().optional(),
  })
);
