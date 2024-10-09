import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export const rejectRankingCategorySchema = Joi.object({
  reason: Joi.string().trim().required(),
});

export class RejectRankingCategoryDto {
  @ApiProperty({
    type: String,
    description: 'The reason for rejecting the listing',
    required: true,
  })
  reason: string;
}
