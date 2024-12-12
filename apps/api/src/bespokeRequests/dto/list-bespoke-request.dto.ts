import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { bespokeRequestStatus } from '../enum/bespoke-request-status';
import { PaymentStatus } from '../../rankingRequest/enum/payment-status.enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListBespokeRequestDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by bespoke request',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: bespokeRequestStatus.APPROVED,
    enum: bespokeRequestStatus,
    description: 'The status of the bespoke Request',
    required: false,
  })
  status?: bespokeRequestStatus;

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
}

export const listBespokeRequestSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(bespokeRequestStatus))
    .optional(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
});
