import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { FeatureRequestStatus } from '../enum/feature-request-status';
import { PaymentStatus } from '../../rankingRequest/enum/payment-status.enum';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export class ListFeatureRequestDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by feature request name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: FeatureRequestStatus.APPROVED,
    enum: FeatureRequestStatus,
    description: 'The status of the feature Request',
    required: false,
  })
  status?: FeatureRequestStatus;

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
    type: String,
  })
  paymentStatus?: PaymentStatus;
}

export const listFeatureRequestSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(FeatureRequestStatus))
    .optional(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
});
