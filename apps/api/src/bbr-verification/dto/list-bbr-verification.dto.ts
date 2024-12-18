import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { BbrVerificationStatus } from '../enum/bbr-verification-status';
import { PaymentStatus } from '../../rankingRequest/enum/payment-status.enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { VerificationType } from '../enum/verification-type.enum';

export class ListBbrVerificationDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by verification name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: BbrVerificationStatus.APPROVED,
    enum: BbrVerificationStatus,
    description: 'The status of the verification',
    required: false,
  })
  status?: BbrVerificationStatus;

  @ApiProperty({
    description: 'Filter by residence ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  residenceId?: string;

  @ApiProperty({
    description: 'Filter by payment status',
    example: PaymentStatus.PAID,
    required: false,
    enum: PaymentStatus,
  })
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Filter by verification type',
    example: VerificationType.E_VERIFICATION,
    required: false,
    enum: VerificationType,
  })
  verificationType?: VerificationType;
}

export const listBbrVerificationSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(BbrVerificationStatus))
    .optional(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  verificationType: Joi.string()
    .valid(...Object.values(VerificationType))
    .optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
});
