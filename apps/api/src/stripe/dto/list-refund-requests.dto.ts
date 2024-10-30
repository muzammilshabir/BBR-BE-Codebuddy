import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RefundStatus } from '../enum/refund-status.enum';

export class ListRefundRequestsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by refund status',
    example: RefundStatus.REFUNDED,
    enum: RefundStatus,
    required: false,
    type: String,
  })
  status?: RefundStatus;

  @ApiProperty({
    description: 'Search by refund request info',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listRefundRequestsDtoSchema = PaginationSchema.append({
  status: Joi.string()
    .valid(...Object.values(RefundStatus))
    .optional(),
  search: Joi.string().optional(),
});
