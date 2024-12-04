import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { BbrVerificationStatus } from '../enum/bbr-verification-status';

export class UpdateBbrVerificationDto {
  @ApiProperty({ required: false, description: 'Verification status', enum: BbrVerificationStatus })
  status?: BbrVerificationStatus;

  @ApiProperty({ required: false, description: 'Verification start date' })
  verifiedOn?: Date;

  @ApiProperty({ required: false, description: 'Verification withdrawal date' })
  withdrawnOn?: Date;

  @ApiProperty({ required: false, description: 'Verification rejection reason' })
  rejectedReason?: string;

  @ApiProperty({ required: false, description: 'Verification insight' })
  verificationInsight?: string;
}

export const updateBbrVerificationSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(BbrVerificationStatus))
    .optional(),
  verifiedOn: Joi.date().optional(),
  withdrawnOn: Joi.date().optional(),
  rejectedReason: Joi.string().optional(),
  verificationInsight: Joi.string().optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.status === BbrVerificationStatus.REJECTED && !value.rejectedReason) {
      return helpers.error('any.custom', {
        message: 'Rejected reason is required when status is REJECTED',
      });
    }
    return value;
  });
