import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PaymentStatus } from '../enum/payment-status.enum';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export class CreateRankingRequestDto {
  @ApiProperty({
    description: 'ID of the ranking category',
    example: '60d7fe6f9eb1f24a04d65633',
    required: true,
  })
  rankingCategoryId: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the residence',
    example: '603d2f7f5d9a3c45f4f4b1e1',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    description: 'Payment status for the ranking request',
    example: PaymentStatus.PENDING,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Array of upload objects',
    example: [{ ImageId: '60d7fe6f9eb1f24a04d65633', type: 'docs' }],
    required: false,
    type: Array,
  })
  upload?: Array<{
    ImageId: Types.ObjectId;
    type?: string;
  }>;
}

export const createRankingRequestSchema = Joi.object({
  rankingCategoryId: Joi.string().required().custom(joiObjectIdValidator('rankingCategoryId')),
  residenceId: Joi.string().required().custom(joiObjectIdValidator('residenceId')),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .default(PaymentStatus.PENDING),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        type: Joi.string().optional(),
      })
    )
    .optional(),
});
