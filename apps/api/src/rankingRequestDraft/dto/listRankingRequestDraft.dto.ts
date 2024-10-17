import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RankingRequestStatus } from '../../rankingRequest/enum/rankingRequest-status.enum';
import { PaymentStatus } from '../../rankingRequest/enum/payment-status.enum';

export class ListRankingRequestDraftDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ranking request draft name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: RankingRequestStatus.ACTIVE,
    enum: RankingRequestStatus,
    description: 'The status of the ranking Request draft',
    required: false,
  })
  status?: RankingRequestStatus;

  @ApiProperty({
    example: PaymentStatus.PAID,
    enum: PaymentStatus,
    description: 'The payment status of the ranking Request draft',
    required: false,
  })
  paymentStatus?: PaymentStatus;
}

export const listRankingRequestDraftSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(RankingRequestStatus))
    .optional(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
});
