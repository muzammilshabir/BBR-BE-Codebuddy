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

export class GetResidenceReviewsDto extends ListPropsDto {
  @ApiProperty({
    enum: RatingSortType,
    description: 'Sort by rating',
    required: false,
  })
  ratingSort?: RatingSortType;

  @ApiProperty({
    description: 'Search by reviewer name or email',
    required: false,
  })
  search?: string;
}

export class ResidenceIdSchemaDto {
  @ApiProperty({
    description: 'Residence ID',
    example: '66acda8b857c576159b74da2',
    required: true,
  })
  residenceId: string;
}

export const getResidenceReviewsSchema = PaginationSchema.concat(
  Joi.object({
    ratingSort: Joi.string()
      .valid(...Object.values(RatingSortType))
      .optional(),
    search: Joi.string().optional(),
  })
);

export const residenceIdSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residence')).required(),
});
