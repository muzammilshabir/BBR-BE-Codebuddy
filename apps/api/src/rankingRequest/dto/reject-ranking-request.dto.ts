import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export const rejectRankingRequestSchema = Joi.object({
  reason: Joi.string().trim().required(),
});

export class RejectRankingRequestDto {
  @ApiProperty({
    type: String,
    description: 'The reason for rejecting the ranking request',
    required: true,
  })
  reason: string;
}
