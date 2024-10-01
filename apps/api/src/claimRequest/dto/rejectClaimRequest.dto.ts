import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class RejectClaimRequestDto {
  @ApiProperty({
    description: 'The resone for the rejection',
    example: 'Invalid documents',
    required: true,
  })
  rejectionReason: string;
}

export const rejectClaimRequestSchema = Joi.object({
  rejectionReason: Joi.string().required(),
});
